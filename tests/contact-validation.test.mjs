import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContactSubmission } from '../app/lib/contact-validation.ts';

const sample = () => ({
  name: 'Visitor',
  email: 'delivered@resend.dev',
  company: '',
  message: 'I would like to discuss an opportunity.',
  website: '',
  submissionId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
});

test('accepts and normalizes a valid submission without changing its meaning', () => {
  const result = validateContactSubmission({
    ...sample(), name: '  José 李 👋  ', email: '  Delivered@RESEND.DEV  ',
    company: '  Care team  ', message: '  Hello Sharath,\r\nLet us talk.  ',
    submissionId: '  6BA7B810-9DAD-41D1-80B4-00C04FD430C8  ',
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data, {
    ...sample(), name: 'José 李 👋', email: 'Delivered@resend.dev', company: 'Care team',
    message: 'Hello Sharath,\nLet us talk.',
  });
});

test('accepts an omitted optional company, but rejects null and nonstring fields', () => {
  const noCompany = sample();
  delete noCompany.company;
  assert.equal(validateContactSubmission(noCompany).valid, true);
  for (const field of ['name', 'email', 'company', 'message', 'website', 'submissionId']) {
    for (const value of [null, [], {}, 123, true]) {
      assert.equal(validateContactSubmission({ ...sample(), [field]: value }).valid, false, `${field}: ${JSON.stringify(value)}`);
    }
  }
  for (const value of [null, undefined, [], 'form', 123, true]) {
    assert.equal(validateContactSubmission(value).valid, false);
  }
});

test('rejects missing required fields and blank names or messages', () => {
  for (const field of ['name', 'email', 'message', 'website', 'submissionId']) {
    const payload = sample();
    delete payload[field];
    assert.equal(validateContactSubmission(payload).valid, false, field);
  }
  for (const field of ['name', 'message']) {
    assert.equal(validateContactSubmission({ ...sample(), [field]: '   ' }).valid, false);
  }
});

test('rejects email header injection and malformed email addresses', () => {
  for (const email of [
    'delivered@resend.dev\r\nBcc: bounced@resend.dev',
    '\ndelivered@resend.dev', 'delivered@resend.dev\0', 'delivered\t@resend.dev',
    'Name <delivered@resend.dev>', 'delivered@resend.dev,bounced@resend.dev',
    '.delivered@resend.dev', 'delivered.@resend.dev', 'de..livered@resend.dev',
    'delivered@localhost', 'delivered@-resend.dev', 'delivered@resend..dev',
    'delivered@resend.dev.', 'delivered @resend.dev', 'delivered@@resend.dev',
  ]) assert.equal(validateContactSubmission({ ...sample(), email }).valid, false, JSON.stringify(email));
});

test('enforces email total and local-part length limits', () => {
  const local = 'a'.repeat(64);
  const domain = `${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
  assert.equal(`${local}@${domain}`.length, 254);
  assert.equal(validateContactSubmission({ ...sample(), email: `${local}@${domain}` }).valid, true);
  assert.equal(validateContactSubmission({ ...sample(), email: `${local}@${domain}d` }).valid, false);
  assert.equal(validateContactSubmission({ ...sample(), email: `${local}a@resend.dev` }).valid, false);
});

test('enforces Unicode character length limits at the exact boundaries', () => {
  for (const [field, minimum, maximum] of [['name', 1, 120], ['company', 0, 160], ['message', 10, 5000]]) {
    assert.equal(validateContactSubmission({ ...sample(), [field]: '🙂'.repeat(maximum) }).valid, true, `${field} maximum`);
    assert.equal(validateContactSubmission({ ...sample(), [field]: '🙂'.repeat(maximum + 1) }).valid, false, `${field} over maximum`);
    if (minimum) {
      assert.equal(validateContactSubmission({ ...sample(), [field]: '字'.repeat(minimum) }).valid, true, `${field} minimum`);
      assert.equal(validateContactSubmission({ ...sample(), [field]: '字'.repeat(minimum - 1) }).valid, false, `${field} below minimum`);
    }
  }
});

test('rejects the honeypot and malformed submission IDs', () => {
  for (const website of ['https://resend.dev', ' ', '\n']) {
    assert.equal(validateContactSubmission({ ...sample(), website }).valid, false);
  }
  for (const submissionId of ['', 'not-a-uuid', '00000000-0000-0000-0000-000000000000',
    '6ba7b810-9dad-41d1-10b4-00c04fd430c8', '6ba7b810-9dad-91d1-80b4-00c04fd430c8']) {
    assert.equal(validateContactSubmission({ ...sample(), submissionId }).valid, false);
  }
});

test('rejects unsafe control characters while allowing ordinary message formatting', () => {
  for (const field of ['name', 'company']) {
    assert.equal(validateContactSubmission({ ...sample(), [field]: 'A\r\nB' }).valid, false);
  }
  for (const control of ['\0', '\b', '\x0b', '\x7f', '\x85']) {
    assert.equal(validateContactSubmission({ ...sample(), message: `Message with ${control} a control` }).valid, false);
  }
  assert.equal(validateContactSubmission({ ...sample(), message: 'Line one\n\tLine two' }).valid, true);
});
