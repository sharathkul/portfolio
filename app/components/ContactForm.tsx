"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import styles from "./ContactForm.module.css";

type ContactField = "name" | "email" | "message";
type FieldErrors = Partial<Record<ContactField, string>>;
type FormStatus = "idle" | "sending" | "error" | "success";

const fieldOrder: ContactField[] = ["message", "name", "email"];
const linkedIn = "https://www.linkedin.com/in/sharathkulkarni/";

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const statusMessage = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const retry = useRef<{ payload: string; submissionId: string } | null>(null);
  const focusAfterSubmit = useRef<ContactField | "status" | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const target = focusAfterSubmit.current;
    if (!target) return;
    focusAfterSubmit.current = null;
    if (target === "status") {
      statusMessage.current?.focus();
    } else {
      const field = form.current?.elements.namedItem(target);
      if (field instanceof HTMLElement) field.focus();
    }
  }, [errors, status]);

  function clearError(field: ContactField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const currentForm = event.currentTarget;
    const data = new FormData(currentForm);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
    };
    const validation: FieldErrors = {};
    if (!payload.name) validation.name = "Enter your name.";
    const emailField = currentForm.elements.namedItem("email") as HTMLInputElement;
    if (!payload.email) validation.email = "Enter your email address.";
    else if (!emailField.validity.valid) validation.email = "Enter a valid email address.";
    if (!payload.message) validation.message = "Add a short message.";
    else if (Array.from(payload.message).length < 10) validation.message = "Write at least 10 characters so I have a little context.";

    if (Object.keys(validation).length) {
      focusAfterSubmit.current = fieldOrder.find((field) => validation[field]) ?? "status";
      setErrors(validation);
      setErrorMessage("Check the highlighted fields, then send your message again.");
      setStatus("error");
      return;
    }

    inFlight.current = true;
    setErrors({});
    setErrorMessage("");
    setStatus("sending");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const serializedPayload = JSON.stringify(payload);
      if (retry.current?.payload !== serializedPayload) {
        retry.current = { payload: serializedPayload, submissionId: crypto.randomUUID() };
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: retry.current.submissionId }),
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);
      if (response.ok && result && typeof result === "object" && "success" in result && result.success === true) {
        focusAfterSubmit.current = "status";
        setStatus("success");
        return;
      }

      const nextErrors: FieldErrors = {};
      let message = "Your message could not be confirmed. Please try again, or contact me on LinkedIn.";
      if (result && typeof result === "object") {
        if ("error" in result && typeof result.error === "string") message = result.error;
        if ("errors" in result && result.errors && typeof result.errors === "object") {
          const responseErrors = result.errors as Record<string, unknown>;
          fieldOrder.forEach((field) => {
            if (typeof responseErrors[field] === "string") nextErrors[field] = responseErrors[field];
          });
        }
      }
      focusAfterSubmit.current = fieldOrder.find((field) => nextErrors[field]) ?? "status";
      setErrors(nextErrors);
      setErrorMessage(message);
      setStatus("error");
    } catch {
      focusAfterSubmit.current = "status";
      setErrorMessage("Your message could not be confirmed. Please try again, or contact me on LinkedIn.");
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
    }
  }

  const pending = status === "sending";

  return (
    <section className={styles.contact} id="contact" aria-labelledby="contact-title" data-status={status}>
      <div className={styles.intro}>
        <div>
          <h2 id="contact-title">Over to you.</h2>
          <p>An idea, a question, or something worth building.</p>
        </div>
        <svg className={styles.connection} viewBox="0 0 144 88" fill="none" aria-hidden="true">
          <path className={styles.loop} d="M5 67C27 67 64 62 67 37C72 4 26 7 28 35C30 64 107 75 117 42C126 12 82 9 81 37C80 62 115 67 139 59" />
          <circle cx="139" cy="59" r="3" />
        </svg>
      </div>
      {status === "success" ? (
        <div className={styles.confirmation}>
          <Check className={styles.check} size={28} aria-hidden="true" />
          <h3>Note sent.</h3>
          <p ref={statusMessage} className={styles.success} role="status" tabIndex={-1}>Thanks for reaching out. I’ll reply to the email you left.</p>
          <button type="button" className={styles.reset} onClick={() => {
            retry.current = null;
            focusAfterSubmit.current = "message";
            setStatus("idle");
          }}>Write another note</button>
        </div>
      ) : (
        <form ref={form} className={styles.form} action="/api/contact" method="post" onSubmit={sendMessage} noValidate aria-busy={pending}>
          <div className={styles.field}>
            <label htmlFor="contact-message">Your note</label>
            <textarea id="contact-message" name="message" rows={3} required minLength={10} maxLength={5000} readOnly={pending}
              placeholder="Hi Sharath, I wanted to reach out about…"
              aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} onChange={() => clearError("message")} />
            {errors.message && <p id="contact-message-error" className={styles.fieldError}>{errors.message}</p>}
          </div>
          <div className={styles.nameEmail}>
            <div className={styles.field}>
              <label htmlFor="contact-name">From</label>
              <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your name" required maxLength={120} readOnly={pending}
                aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} onChange={() => clearError("name")} />
              {errors.name && <p id="contact-name-error" className={styles.fieldError}>{errors.name}</p>}
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email">Reply to</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" inputMode="email" spellCheck={false} autoCapitalize="none" placeholder="Your email" required maxLength={254} readOnly={pending}
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} onChange={() => clearError("email")} />
              {errors.email && <p id="contact-email-error" className={styles.fieldError}>{errors.email}</p>}
            </div>
          </div>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {status === "error" && <p ref={statusMessage} className={styles.formError} role="alert" tabIndex={-1}>{errorMessage}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.send} disabled={pending}>{pending ? "Sending…" : "Send note"}<ArrowUpRight size={20} aria-hidden="true" /></button>
            <a className={styles.linkedIn} href={linkedIn} target="_blank" rel="noopener noreferrer">Or LinkedIn <ArrowUpRight size={16} aria-hidden="true" /></a>
            <span className={styles.sending} role="status" aria-live="polite">{pending ? "Sending your message." : ""}</span>
          </div>
        </form>
      )}
      {status === "success" && <a className={styles.linkedIn} href={linkedIn} target="_blank" rel="noopener noreferrer">Or LinkedIn <ArrowUpRight size={16} aria-hidden="true" /></a>}
    </section>
  );
}
