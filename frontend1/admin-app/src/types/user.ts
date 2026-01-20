export type UserRole = "CUSTOMER" | "TEAM_BUYER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  displayUsername: string | null;
  role: UserRole;
  locale: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  isDeleted?: boolean;
  isLocked?: boolean;
  sessionCount?: number;
  lastLogin?: string | null;
}

export interface UserListParams {
  search?: string;
  role?: UserRole;
  emailVerified?: boolean;
  locked?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: string;
}

export interface UserDetails {
  user: User;
  lockoutStatus: LockoutStatus;
  sessionCount: number;
  lastLogin: string | null;
}

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
  expiresAt: Date | string;
  updatedAt: Date | string;
}

export interface UserSessionsResponse {
  sessions: SessionInfo[];
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  eventType: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
}

export interface UserAuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

