/**
 * Input validation and sanitization for public portfolio forms (contact, testimonials).
 * Not used in admin forms.
 */

// Max lengths (aligned with backend where applicable)
export const LIMITS = {
  name: 200,
  email: 254,
  message: 300,
  subject: 500,
  role: 200,
  company: 200,
  content: 300,
} as const;

/** Strip HTML tags and dangerous chars to prevent XSS. */
export function sanitizeString(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  let s = value
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
  if (s.length > maxLength) s = s.slice(0, maxLength);
  return s;
}

/** Trim and enforce max length without escaping (for validation/submit; use capLength for live input). */
export function trimAndCap(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  const s = value.trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}

/** Enforce max length only; do not trim. Use in input onChange so spaces can be typed. */
export function capLength(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/** Basic email format validation. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length <= LIMITS.email && EMAIL_REGEX.test(trimmed);
}

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> };

/** Validate and sanitize contact form. */
export function validateContactForm(data: { name: string; email: string; message: string }): ValidationResult<{ name: string; email: string; subject: string; message: string }> {
  const errors: Record<string, string> = {};
  const name = trimAndCap(data.name, LIMITS.name);
  const email = data.email.trim().toLowerCase().slice(0, LIMITS.email);
  const message = trimAndCap(data.message, LIMITS.message);

  if (!name) errors.name = "Name is required.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";

  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";

  if (!message) errors.message = "Message is required.";
  else if (message.length < 10) errors.message = "Message must be at least 10 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: sanitizeString(name, LIMITS.name),
      email: sanitizeString(email, LIMITS.email),
      subject: "Contact from portfolio",
      message: sanitizeString(message, LIMITS.message),
    },
  };
}

/** Validate and sanitize testimonial form. */
export function validateTestimonialForm(data: {
  name: string;
  email: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}): ValidationResult<{ name: string; email: string; role: string | null; company: string | null; content: string; rating: number }> {
  const errors: Record<string, string> = {};
  const name = trimAndCap(data.name, LIMITS.name);
  const email = data.email.trim().toLowerCase().slice(0, LIMITS.email);
  const role = trimAndCap(data.role, LIMITS.role) || null;
  const company = trimAndCap(data.company, LIMITS.company) || null;
  const content = trimAndCap(data.content, LIMITS.content);
  const rating = typeof data.rating === "number" && Number.isInteger(data.rating) ? Math.min(5, Math.max(1, data.rating)) : 5;

  if (!name) errors.name = "Name is required.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";

  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";

  if (!content) errors.content = "Message is required.";
  else if (content.length < 10) errors.content = "Message must be at least 10 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: sanitizeString(name, LIMITS.name),
      email: sanitizeString(email, LIMITS.email),
      role: role ? sanitizeString(role, LIMITS.role) : null,
      company: company ? sanitizeString(company, LIMITS.company) : null,
      content: sanitizeString(content, LIMITS.content),
      rating,
    },
  };
}
