/**
 * Utility function to parse authentication errors from various formats
 * Handles Better Auth errors, HTTP responses, nested objects, and string formats
 *
 * @param error - The error to parse (can be string, object, or unknown)
 * @param defaultMessage - Default message to return if no message can be extracted
 * @returns The extracted error message string
 */
export function parseAuthError(
  error: unknown,
  defaultMessage: string = "Login failed. Please check your credentials.",
): string {
  if (!error) {
    return defaultMessage;
  }

  // Handle string errors
  if (typeof error === "string") {
    // Try to parse as JSON if it looks like JSON
    if (error.includes('"message"') || error.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(error);
        if (parsed?.error?.message) {
          return parsed.error.message;
        } else if (parsed?.message) {
          return parsed.message;
        }
      } catch {
        // Not valid JSON, try regex extraction
        const match = error.match(/"message"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return error;
  }

  // Handle object errors
  if (typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Check for Better Auth error format: { error: { message: string } }
    if (errorObj?.error && typeof errorObj.error === "object") {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === "string") {
        return nestedError.message;
      }
      // Handle deeply nested: { error: { error: { message: string } } }
      if (nestedError.error && typeof nestedError.error === "object") {
        const deepError = nestedError.error as Record<string, unknown>;
        if (typeof deepError.message === "string") {
          return deepError.message;
        }
      }
    }

    // Check for direct message property
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }

    // Check for error as string
    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }

    // Check for statusText (HTTP response)
    if (typeof errorObj.statusText === "string") {
      return errorObj.statusText;
    }
  }

  return defaultMessage;
}
