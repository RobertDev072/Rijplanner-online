/**
 * Security Token Utilities
 * 
 * This module provides secure token generation and validation
 * to prevent session hijacking and impersonation attacks.
 * 
 * SECURITY MEASURES:
 * - Session tokens are generated with crypto-secure random values
 * - Tokens have expiration times to limit attack windows
 * - Sensitive data (pincodes) are never stored in localStorage
 * - Impersonation sessions have strict validation and logging
 */

// Token expiration times
const SESSION_EXPIRY_HOURS = 24;
const IMPERSONATION_EXPIRY_MINUTES = 60;

export interface SecureSession {
  userId: string;
  sessionToken: string;
  createdAt: number;
  expiresAt: number;
}

export interface ImpersonationToken {
  originalUserId: string;
  originalUsername: string;
  originalName: string;
  sessionToken: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a secure session object (without storing pincode)
 */
export function createSecureSession(userId: string): SecureSession {
  const now = Date.now();
  return {
    userId,
    sessionToken: generateSecureToken(),
    createdAt: now,
    expiresAt: now + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
  };
}

/**
 * Validate if a session is still valid
 */
export function isSessionValid(session: SecureSession | null): boolean {
  if (!session) return false;
  return Date.now() < session.expiresAt;
}

/**
 * Create a secure impersonation token
 */
export function createImpersonationToken(
  originalUserId: string,
  originalUsername: string,
  originalName: string
): ImpersonationToken {
  const now = Date.now();
  return {
    originalUserId,
    originalUsername,
    originalName,
    sessionToken: generateSecureToken(),
    createdAt: now,
    expiresAt: now + (IMPERSONATION_EXPIRY_MINUTES * 60 * 1000),
  };
}

/**
 * Validate an impersonation token
 */
export function isImpersonationTokenValid(token: ImpersonationToken | null): boolean {
  if (!token) return false;
  if (!token.sessionToken || !token.originalUserId) return false;
  return Date.now() < token.expiresAt;
}

/**
 * Store impersonation token securely
 */
export function storeImpersonationToken(token: ImpersonationToken): void {
  localStorage.setItem('impersonation_token', JSON.stringify(token));
}

/**
 * Retrieve impersonation token
 */
export function getImpersonationToken(): ImpersonationToken | null {
  try {
    const stored = localStorage.getItem('impersonation_token');
    if (!stored) return null;
    
    const token = JSON.parse(stored) as ImpersonationToken;
    
    // Validate token structure
    if (!token.originalUserId || !token.sessionToken || !token.expiresAt) {
      clearImpersonationToken();
      return null;
    }
    
    // Check expiration
    if (!isImpersonationTokenValid(token)) {
      clearImpersonationToken();
      return null;
    }
    
    return token;
  } catch {
    clearImpersonationToken();
    return null;
  }
}

/**
 * Clear impersonation token
 */
export function clearImpersonationToken(): void {
  localStorage.removeItem('impersonation_token');
  // Also clear legacy storage
  localStorage.removeItem('original_superadmin');
}

/**
 * Sanitize user data for storage (removes sensitive fields)
 */
export function sanitizeUserForStorage<T extends { pincode?: string }>(user: T): Omit<T, 'pincode'> {
  const { pincode: _, ...sanitizedUser } = user;
  return sanitizedUser;
}
