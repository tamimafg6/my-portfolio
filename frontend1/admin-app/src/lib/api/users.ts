import { authServiceFetch } from "../api";
import type {
  UserListParams,
  UserListResponse,
  UserDetails,
  UserSessionsResponse,
  UserAuditLogsResponse,
  UserRole,
} from "@/types/user";

/**
 * Fetch list of users with filters and pagination
 */
export async function fetchUsers(
  params: UserListParams = {}
): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.append("search", params.search);
  }
  if (params.role) {
    searchParams.append("role", params.role);
  }
  if (params.emailVerified !== undefined) {
    searchParams.append("emailVerified", String(params.emailVerified));
  }
  if (params.locked !== undefined) {
    searchParams.append("locked", String(params.locked));
  }
  if (params.includeDeleted !== undefined) {
    searchParams.append("includeDeleted", String(params.includeDeleted));
  }
  if (params.page) {
    searchParams.append("page", String(params.page));
  }
  if (params.limit) {
    searchParams.append("limit", String(params.limit));
  }
  if (params.sortBy) {
    searchParams.append("sortBy", params.sortBy);
  }
  if (params.sortDirection) {
    searchParams.append("sortDirection", params.sortDirection);
  }

  const queryString = searchParams.toString();
  const url = `/api/auth/admin/users${queryString ? `?${queryString}` : ""}`;

  const response = await authServiceFetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch users" }));
    throw new Error(
      errorData.error || `Failed to fetch users: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch user details by ID
 */
export async function fetchUserDetails(userId: string): Promise<UserDetails> {
  const url = `/api/auth/admin/users/${encodeURIComponent(userId)}`;
  const response = await authServiceFetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch user details" }));
    throw new Error(
      errorData.error || `Failed to fetch user details: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ message: string; userId: string; oldRole: string; newRole: string }> {
  const response = await authServiceFetch(
    `/api/auth/users/${userId}/role`,
    {
      method: "PUT",
      body: JSON.stringify({ role }),
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to update user role" }));
    throw new Error(
      errorData.error || `Failed to update user role: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Initiate password reset for a user (admin-initiated)
 */
export async function resetUserPassword(
  userId: string
): Promise<{ message: string; userId: string; emailSent: boolean }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/reset-password`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to reset password" }));
    throw new Error(
      errorData.error || `Failed to reset password: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Unlock a locked user account
 */
export async function unlockUserAccount(
  userId: string
): Promise<{ message: string; userId: string }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/unlock`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to unlock account" }));
    throw new Error(
      errorData.error || `Failed to unlock account: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Lock a user account (admin-initiated)
 */
export async function lockUserAccount(
  userId: string
): Promise<{ message: string; userId: string }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/lock`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to lock account" }));
    throw new Error(
      errorData.error || `Failed to lock account: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(
  userId: string
): Promise<{ message: string; userId: string; revokedCount: number }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/sessions`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to revoke sessions" }));
    throw new Error(
      errorData.error || `Failed to revoke sessions: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch audit logs for a user
 */
export async function fetchUserAuditLogs(
  userId: string,
  params: { eventType?: string; limit?: number; offset?: number } = {}
): Promise<UserAuditLogsResponse> {
  const searchParams = new URLSearchParams();

  if (params.eventType) {
    searchParams.append("eventType", params.eventType);
  }
  if (params.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    searchParams.append("offset", String(params.offset));
  }

  const queryString = searchParams.toString();
  const url = `/api/auth/admin/users/${userId}/audit-logs${queryString ? `?${queryString}` : ""}`;

  const response = await authServiceFetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch audit logs" }));
    throw new Error(
      errorData.error || `Failed to fetch audit logs: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch all sessions for a user
 */
export async function fetchUserSessions(
  userId: string
): Promise<UserSessionsResponse> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/sessions`
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch user sessions" }));
    throw new Error(
      errorData.error || `Failed to fetch user sessions: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Soft delete a user account
 */
export async function deleteUser(
  userId: string
): Promise<{ message: string; userId: string; deletedAt: string }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({ error: "Invalid request" }));
      throw new Error(errorData.error || "Invalid request");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to delete user" }));
    throw new Error(
      errorData.error || `Failed to delete user: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Permanently delete a user account (cannot be undone)
 */
export async function permanentlyDeleteUser(
  userId: string
): Promise<{ message: string; userId: string; email: string }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/permanent`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({ error: "Invalid request" }));
      throw new Error(errorData.error || "Invalid request");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to permanently delete user" }));
    throw new Error(
      errorData.error || `Failed to permanently delete user: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Restore a soft-deleted user account
 */
export async function restoreUser(
  userId: string
): Promise<{ message: string; userId: string; restoredAt: string }> {
  const response = await authServiceFetch(
    `/api/auth/admin/users/${userId}/restore`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Admin access required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({ error: "Invalid request" }));
      throw new Error(errorData.error || "Invalid request");
    }
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to restore user" }));
    throw new Error(
      errorData.error || `Failed to restore user: ${response.status}`
    );
  }

  return response.json();
}

