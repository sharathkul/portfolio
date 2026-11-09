export type ContactSubmission = {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
  submissionId: string;
};

export type ContactValidationResult =
  | { valid: true; data: ContactSubmission }
  | { valid: false; errors: Record<string, string> };

const singleLineControls = /[\u0000-\u001f\u007f-\u009f]/;
const messageControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function characterCount(value: string): number {
  return Array.from(value).length;
}

export function isValidContactEmail(value: string): boolean {
  if (value.length > 254 || singleLineControls.test(value)) return false;

  const parts = value.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false;
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;

  const labels = domain.split('.');
  return labels.length >= 2 && labels.every((label) =>
    label.length >= 1 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

export function validateContactSubmission(input: unknown): ContactValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: { form: 'Please check the form and try again.' } };
  }

  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};
  let name = '';
  let email = '';
  let company = '';
  let message = '';
  let submissionId = '';

  if (typeof raw.name !== 'string') {
    errors.name = 'Please enter your name.';
  } else {
    name = raw.name.trim();
    if (!name || characterCount(name) > 120 || singleLineControls.test(raw.name)) {
      errors.name = 'Please enter a name of up to 120 characters.';
    }
  }

  if (typeof raw.email !== 'string' || singleLineControls.test(raw.email)) {
    errors.email = 'Please enter a valid email address.';
  } else {
    email = raw.email.trim();
    if (!isValidContactEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    } else {
      const at = email.lastIndexOf('@');
      email = email.slice(0, at + 1) + email.slice(at + 1).toLowerCase();
    }
  }

  if (raw.company !== undefined) {
    if (typeof raw.company !== 'string') {
      errors.company = 'Please enter a company name or leave this blank.';
    } else {
      company = raw.company.trim();
      if (characterCount(company) > 160 || singleLineControls.test(raw.company)) {
        errors.company = 'Please use up to 160 characters for the company name.';
      }
    }
  }

  if (typeof raw.message !== 'string') {
    errors.message = 'Please enter a message.';
  } else {
    message = raw.message.replace(/\r\n?/g, '\n').trim();
    const length = characterCount(message);
    if (length < 10 || length > 5000 || messageControls.test(raw.message)) {
      errors.message = 'Please write a message between 10 and 5,000 characters.';
    }
  }

  if (typeof raw.website !== 'string' || raw.website !== '') {
    errors.form = 'We could not send this message. Please try again.';
  }

  if (typeof raw.submissionId !== 'string' || !uuidPattern.test(raw.submissionId.trim())) {
    errors.form = 'Please refresh the page and try again.';
  } else {
    submissionId = raw.submissionId.trim().toLowerCase();
  }

  if (Object.keys(errors).length) return { valid: false, errors };

  return { valid: true, data: { name, email, company, message, website: '', submissionId } };
}
