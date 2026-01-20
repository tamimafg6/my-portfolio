/**
 * Auth error handling utilities for portfolio admin login
 */

/**
 * Format authentication error message
 */
export function formatAuthErrorMessage(
  error: { message?: string } | string | null | undefined,
): string {
  // Handle string errors
  if (typeof error === "string") {
    const errorMessage = error.toLowerCase();
    // Check for account locked messages
    if (errorMessage.includes("locked") || errorMessage.includes("423")) {
      return error;
    }
    return error;
  }

  // Handle object errors
  if (!error?.message) {
    return "An error occurred. Please try again.";
  }

  const errorMessage = error.message.toLowerCase();

  // Check if error is due to account being locked (423 status)
  if (
    errorMessage.includes("locked") ||
    errorMessage.includes("account locked")
  ) {
    return error.message;
  }

  if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
    return "Access denied. Admin privileges required.";
  }

  if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
    return "Invalid credentials. Please try again.";
  }

  return error.message;
}
