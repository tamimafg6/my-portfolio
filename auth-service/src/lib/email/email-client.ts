/**
 * HTTP client for email-service
 * Used by Better Auth hooks to send emails via email-service.
 * When EMAIL_SERVICE_URL is not set, all send functions no-op (success, no email sent).
 */

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;

/** If true, we skip calling any external email service (for dev or when you don't use one). */
const EMAIL_DISABLED = !EMAIL_SERVICE_URL || EMAIL_SERVICE_URL.trim() === "";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Centralized POST request to email-service with robust error handling.
 * No-ops when EMAIL_SERVICE_URL is not set (no email service).
 */
async function postEmailService(
  body: unknown
): Promise<SendEmailResult> {
  if (EMAIL_DISABLED) {
    return { success: true };
  }
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    
    // Add API key authentication if configured
    if (EMAIL_API_KEY) {
      headers["Authorization"] = `Bearer ${EMAIL_API_KEY}`;
    }
    
    const response = await fetch(`${EMAIL_SERVICE_URL!.trim()}/api/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    let parsed: any = null;
    try {
      parsed = await response.json();
    } catch {
      // leave parsed as null; fall back to status text
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          parsed?.error ??
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Normalize success payload to always include a boolean success field
    return {
      success: parsed?.success ?? true,
      messageId: parsed?.messageId,
      error: parsed?.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error calling email-service:", error);
    return {
      success: false,
      error: `Failed to connect to email-service: ${errorMessage}`,
    };
  }
}

/**
 * Send verification email via email-service
 */
export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  userName?: string
): Promise<SendEmailResult> {
  return await postEmailService({
    type: "verification",
    to,
    data: { verificationUrl, userName },
  });
}

/**
 * Send password reset email via email-service
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string
): Promise<SendEmailResult> {
  return await postEmailService({
    type: "password-reset",
    to,
    data: { resetUrl, userName },
  });
}

