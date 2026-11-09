import { createHash } from 'node:crypto';
import { checkBotId } from 'botid/server';
import { Resend } from 'resend';
import { isValidContactEmail, validateContactSubmission } from '../../lib/contact-validation';

export const runtime = 'nodejs';
export const maxDuration = 15;

const MAX_BODY_BYTES = 24 * 1024;
const SEND_ERROR = 'Your message could not be sent right now. Please try again, or contact me on LinkedIn.';
const responseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status, headers: responseHeaders });
}

function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    const targetHost = request.headers.get('host') || target.host;
    return (source.protocol === 'https:' || source.protocol === 'http:') &&
      source.origin === origin && source.host === targetHost && source.protocol === target.protocol;
  } catch {
    return false;
  }
}

class BodyTooLargeError extends Error {}

async function readBoundedJson(request: Request): Promise<unknown> {
  const lengthHeader = request.headers.get('content-length');
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) throw new BodyTooLargeError();
  if (!request.body) throw new Error('Missing body');

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let body = '';
  let bytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new BodyTooLargeError();
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } finally {
    reader.releaseLock();
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export async function POST(request: Request): Promise<Response> {
  if (!hasSameOrigin(request)) return json({ error: 'This request could not be verified. Please use the contact form on this website.' }, 403);

  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') return json({ error: 'Please enable JavaScript to use this form, or contact me on LinkedIn.' }, 415);

  let input: unknown;
  try {
    input = await readBoundedJson(request);
  } catch (error) {
    return error instanceof BodyTooLargeError
      ? json({ error: 'This message is too large. Please shorten it and try again.' }, 413)
      : json({ error: 'Please check the form and try again.' }, 400);
  }

  const validation = validateContactSubmission(input);
  if (validation.valid === false) {
    return json({ error: 'Please check the form and try again.', errors: validation.errors }, 400);
  }

  try {
    const verification = await checkBotId();
    if (verification.isBot) return json({ error: 'This request could not be verified. Please try again or contact me on LinkedIn.' }, 403);
  } catch {
    console.error('Contact request verification unavailable.');
    return json({ error: SEND_ERROR }, 503);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  if (!apiKey || !recipient || !isValidContactEmail(recipient) || !domain ||
    !isValidContactEmail(`website@${domain}`) || /[<>\s@]/.test(domain)) {
    console.error('Contact delivery settings unavailable.');
    return json({ error: SEND_ERROR }, 503);
  }

  const { name, email, company, message, submissionId } = validation.data;
  const text = [
    'New portfolio contact',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    ...(company ? [`Company: ${company}`] : []),
    '',
    message,
  ].join('\n');
  const html = `<h1>New portfolio contact</h1><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}${company ? `<br><strong>Company:</strong> ${escapeHtml(company)}` : ''}</p><p style="white-space: pre-wrap">${escapeHtml(message)}</p>`;
  const payloadHash = createHash('sha256').update(JSON.stringify({ name, email, company, message })).digest('hex');

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: `Portfolio <website@${domain}>`,
      to: recipient,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text,
      html,
    }, { idempotencyKey: `contact/${submissionId}/${payloadHash}` });

    if (error || !data?.id) {
      console.error('Contact delivery was not accepted.');
      return json({ error: SEND_ERROR }, error?.name === 'rate_limit_exceeded' ? 429 : 502);
    }
    return json({ success: true }, 200);
  } catch {
    console.error('Contact delivery unavailable.');
    return json({ error: SEND_ERROR }, 502);
  }
}
