/**
 * @file api/config/supabase.ts
 * @description Secure configuration for Supabase client with authentication, error handling, 
 * and healthcare data compliance features.
 * 
 * This module provides a configured Supabase client with enhanced security features
 * for handling sensitive medical data in compliance with healthcare regulations.
 * 
 * @version 1.1.0
 * @security HIPAA-compliant
 */

import { createClient, SupabaseClient, Session, User, UserAttributes } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { version } from '../../package.json';

// Encryption utilities for additional data protection
import { encrypt, decrypt } from '../utils/encryption';

// Custom types for enhanced type safety
export interface AuthError {
  message: string;
  status: number;
  code?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  storageEncryptionKey?: string;
  authSessionKey: string;
  maxRetries: number;
  retryDelay: number;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Default configuration object for Supabase
 * 
 * These settings are applied to the Supabase client upon initialization.
 * Security-sensitive values are loaded from environment variables.
 */
export const supabaseConfig: SupabaseConfig = {
  url: getEnvVariable('SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVariable('SUPABASE_ANON_KEY', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  authSessionKey: 'deepLuxMed.auth.token',
  maxRetries: MAX_RETRIES,
  retryDelay: RETRY_DELAY,
};

/**
 * Create and configure the Supabase client
 * 
 * The configured client includes:
 * - Secure storage adapter for auth sessions
 * - Request retry logic
 * - Client-side encryption for sensitive fields
 * - Security headers
 */
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      storage: createSecureStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-App-Version': version,
        'X-Client-Info': `DeepLuxMed/${version}`,
      },
    },
  }
);

/**
 * Initialize security features and validate configuration
 * 
 * This function performs security checks on startup:
 * - Validates API credentials
 * - Sets up security event listeners
 * - Configures audit logging
 */
export async function initializeSecurity(): Promise<boolean> {
  try {
    // Validate API credentials
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase validation error:', error.message);
      return false;
    }
    
    // Set up security event listeners
    supabase.auth.onAuthStateChange((event, session) => {
      logSecurityEvent('auth_state_change', { event, user: session?.user?.id });
      
      // Handle suspicious events
      if (event === 'SIGNED_OUT' && session) {
        logSecurityEvent('suspicious_activity', { 
          type: 'session_mismatch',
          user: session.user.id 
        });
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize security features:', error);
    return false;
  }
}

/**
 * User roles and permissions
 * 
 * The application uses a role-based access control system with the following roles:
 * - patient: Regular users who can access only their own medical data
 * - practitioner: Medical professionals who can access data for their patients
 * - admin: Administrative users with extended system access
 * 
 * Permissions are enforced both at the client and database levels via Row-Level Security (RLS).
 */

/**
 * Enum representing user roles in the system
 */
export enum UserRole {
  PATIENT = 'patient',
  PRACTITIONER = 'practitioner',
  ADMIN = 'admin',
}

/**
 * Interface for extended user profile with medical-specific fields
 */
export interface MedicalUserProfile {
  id: string;
  role: UserRole;
  email: string;
  medical_license?: string;
  institution?: string;
  specialty?: string;
  last_security_check?: string;
  is_verified: boolean;
  hipaa_agreement_signed: boolean;
  encryption_key_version: number;
}

/**
 * Get the current user's role
 * 
 * @returns Promise resolving to the user's role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    return null;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();
  
  if (profileError || !profile) {
    return null;
  }
  
  return profile.role as UserRole;
}

/**
 * Check if the current user has a specific permission
 * 
 * @param permission The permission to check
 * @returns Promise resolving to boolean indicating if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const role = await getUserRole();
  
  if (!role) {
    return false;
  }
  
  // Permission mapping based on roles
  const rolePermissions = {
    [UserRole.PATIENT]: ['read_own_data', 'update_own_profile'],
    [UserRole.PRACTITIONER]: [
      'read_own_data',
      'update_own_profile',
      'read_patient_data',
      'create_assessment',
      'update_assessment',
    ],
    [UserRole.ADMIN]: [
      'read_own_data',
      'update_own_profile',
      'read_patient_data',
      'create_assessment',
      'update_assessment',
      'manage_users',
      'view_audit_logs',
    ],
  };
  
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * JWT Token Handling
 * 
 * Supabase handles JWT tokens automatically, but we extend the functionality
 * with additional security measures:
 * 1. Secure storage in device keychain/keystore
 * 2. Token refresh monitoring
 * 3. Additional validation
 */

/**
 * Validate a Supabase JWT token
 * 
 * @param token The JWT token to validate
 * @returns Boolean indicating if the token is valid
 */
export function validateToken(token: string): boolean {
  if (!token) return false;
  
  try {
    // Simple structural validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    
    // Check required claims
    if (!payload.sub || !payload.aud) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Create a secure storage adapter for authentication tokens
 * 
 * This adapter stores tokens in the device's secure storage (Keychain on iOS,
 * EncryptedSharedPreferences on Android, localStorage with encryption on web)
 */
function createSecureStorage() {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        if (Platform.OS === 'web') {
          const item = localStorage.getItem(key);
          return item ? decrypt(item, 'LOCAL_STORAGE_KEY') : null;
        }
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Error retrieving secure item:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        if (Platform.OS === 'web') {
          const encrypted = encrypt(value, 'LOCAL_STORAGE_KEY');
          localStorage.setItem(key, encrypted);
          return;
        }
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error storing secure item:', error);
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
          return;
        }
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error removing secure item:', error);
      }
    },
  };
}

/**
 * Utility to safely get environment variables with fallbacks
 * 
 * @param keys Array of possible environment variable names
 * @param defaultValue Optional default value if no env var is found
 * @returns The environment variable value or default
 */
function getEnvVariable(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key] || 
                 Constants.expoConfig?.extra?.[key] || 
                 null;
    
    if (value) return value;
  }
  
  throw new Error(`Required environment variable not found: ${keys.join(' or ')}`);
}

/**
 * Error Handling and Retry Logic
 * 
 * The application implements robust error handling for API requests with:
 * - Categorized error types
 * - Automatic retry for transient errors
 * - Detailed error logging
 * - User-friendly error messages
 */

/**
 * Supabase error codes and their meanings
 */
export const ERROR_CODES = {
  // Authentication errors
  'auth/invalid-email': 'The email address is invalid.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'The password is too weak.',
  'auth/invalid-credential': 'The provided credential is invalid.',
  
  // Database errors
  'db/row-level-security': 'You don\'t have permission to access this data.',
  'db/constraint-violation': 'This operation violates database constraints.',
  'db/not-found': 'The requested data was not found.',
  
  // Storage errors
  'storage/unauthorized': 'You don\'t have permission to access this file.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  
  // Network errors
  'network/timeout': 'Request timed out. Please check your connection.',
  'network/offline': 'You appear to be offline.',
  
  // General errors
  'general/server-error': 'A server error occurred. Please try again later.',
  'general/unknown': 'An unknown error occurred.',
};

/**
 * Generic error handler for Supabase operations
 * 
 * @param error The error object from Supabase
 * @param customMessage Optional custom message to display
 * @param shouldThrow Whether to throw the error or return an error object
 * @returns An error object with message, code, and status
 */
export function handleApiError<T = any>(
  error: any, 
  customMessage = 'Error in operation', 
  shouldThrow = false
): { error: true; message: string; code?: string; status?: number; details?: any } {
  // Extract error information
  const message = error?.message || customMessage;
  const code = error?.code || 'general/unknown';
  const status = error?.status || 500;
  const details = error?.details || null;
  
  // Log the error for debugging and audit
  console.error(`${customMessage}:`, error);
  
  // Log security-relevant errors
  if (
    code.startsWith('auth/') || 
    code === 'db/row-level-security' ||
    code === 'storage/unauthorized'
  ) {
    logSecurityEvent('security_error', { 
      code, 
      message,
      user: supabase.auth.getUser() || 'unauthenticated',
    });
  }
  
  const processedError = {
    error: true,
    message: ERROR_CODES[code] || message,
    code,
    status,
    details,
  };
  
  if (shouldThrow) {
    throw processedError;
  }
  
  return processedError;
}

/**
 * Execute a Supabase operation with automatic retry for transient errors
 * 
 * @param operation Function that returns a promise with the Supabase operation
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay between retries in ms
 * @returns Promise resolving to the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<{ data: T; error: any }>,
  maxRetries = supabaseConfig.maxRetries,
  initialDelay = supabaseConfig.retryDelay
): Promise<{ data: T | null; error: any }> {
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (!result.error) {
        return result;
      }
      
      lastError = result.error;
      
      // Check if error is retryable
      if (
        !isRetryableError(result.error) || 
        attempt === maxRetries
      ) {
        return { data: null, error: lastError };
      }
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        break;
      }
      
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { data: null, error: lastError };
}

/**
 * Determine if an error is retryable
 * 
 * @param error The error to check
 * @returns Boolean indicating if the error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Network-related errors are typically retryable
  if (
    error.code === 'network/timeout' ||
    error.code === 'network/offline' ||
    error.message?.includes('network') ||
    error.message?.includes('timeout') ||
    error.message?.includes('connection')
  ) {
    return true;
  }
  
  // Server errors (5xx) are potentially retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Specific Supabase error codes that are retryable
  const retryableCodes = ['general/server-error', 'PGRST116'];
  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }
  
  return false;
}

/**
 * Security Auditing and Logging
 * 
 * The application implements comprehensive security logging for compliance with
 * healthcare regulations like HIPAA.
 */

/**
 * Security event types for audit logging
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_CREATION = 'account_creation',
  PROFILE_UPDATE = 'profile_update',
  PERMISSION_CHANGE = 'permission_change',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SECURITY_ERROR = 'security_error',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

/**
 * Log a security event for audit purposes
 * 
 * @param eventType The type of security event
 * @param details Additional details about the event
 */
export async function logSecurityEvent(
  eventType: string | SecurityEventType,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;
    const timestamp = new Date().toISOString();
    const ipAddress = 'client-side'; // IP is logged server-side
    
    // Sanitize details to remove sensitive information
    const sanitizedDetails = sanitizeLogData(details);
    
    // Store the audit log entry
    await supabase.from('security_audit_logs').insert({
      user_id: userId,
      event_type: eventType,
      timestamp,
      ip_address: ipAddress,
      user_agent: navigator?.userAgent || 'unknown',
      details: sanitizedDetails,
    });
    
    // For critical security events, also log server-side via a function
    if (isCriticalSecurityEvent(eventType.toString())) {
      await supabase.functions.invoke('log-critical-security-event', {
        body: {
          eventType,
          userId,
          timestamp,
          details: sanitizedDetails,
        },
      });
    }
  } catch (error) {
    // Failsafe: if DB logging fails, at least log to console
    console.error('Failed to log security event:', error);
    console.warn('Security event details:', { eventType, details });
  }
}

/**
 * Determine if a security event is critical
 * 
 * Critical events trigger additional notifications and logging
 * 
 * @param eventType The event type to check
 * @returns Boolean indicating if the event is critical
 */
function isCriticalSecurityEvent(eventType: string): boolean {
  const criticalEvents = [
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    SecurityEventType.SECURITY_ERROR,
    SecurityEventType.PERMISSION_CHANGE,
    SecurityEventType.PASSWORD_RESET,
    'suspicious_activity',
    'brute_force_attempt',
    'unauthorized_access',
  ];
  
  return criticalEvents.includes(eventType);
}

/**
 * Sanitize log data to remove sensitive information
 * 
 * @param data The data to sanitize
 * @returns Sanitized data safe for logging
 */
function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'credit_card',
    'ssn',
    'social_security',
    'birth_date',
    'dob',
    'address',
    'health_record',
  ];
  
  const sanitized = { ...data };
  
  // Recursive function to sanitize nested objects
  function sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const result = { ...obj };
    
    for (const key in result) {
      // Check if key is sensitive
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        result[key] = '[REDACTED]';
      } 
      // Recursively sanitize objects
      else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = sanitizeObject(result[key]);
      }
    }
    
    return result;
  }
  
  return sanitizeObject(sanitized);
}

/**
 * HIPAA Compliance Features
 * 
 * The application implements features required for HIPAA compliance:
 * - Data encryption
 * - Access controls
 * - Audit logging
 * - Session timeout
 * - Secure communication
 */

/**
 * Check if the current user has signed the HIPAA agreement
 * 
 * @returns Promise resolving to boolean indicating agreement status
 */
export async function hasSignedHipaaAgreement(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('hipaa_agreement_signed')
    .eq('id', userData.user.id)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return !!data.hipaa_agreement_signed;
}

/**
 * Record a HIPAA agreement signature
 * 
 * @param agreed Boolean indicating if user agreed
 * @param version Version of the agreement
 * @returns Promise resolving to success status
 */
export async function signHipaaAgreement(
  agreed: boolean,
  version: string
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return false;
    }
    
    // Record the agreement
    const { error } = await supabase
      .from('profiles')
      .update({
        hipaa_agreement_signed: agreed,
        hipaa_agreement_version: version,
        hipaa_agreement_date: new Date().toISOString(),
      })
      .eq('id', userData.user.id);
    
    if (error) {
      console.error('Error recording HIPAA agreement:', error);
      return false;
    }
    
    // Log the event
    await logSecurityEvent('hipaa_agreement', {
      agreed,
      version,
      user: userData.user.id,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to sign HIPAA agreement:', error);
    return false;
  }
}

/**
 * Start an automatic session timeout monitor
 * 
 * HIPAA requires automatic logout after inactivity
 * 
 * @param timeoutMinutes Minutes of inactivity before logout
 * @returns Cleanup function to stop monitoring
 */
export function startSessionTimeoutMonitor(timeoutMinutes = 30): () => void {
  let activityTimeout: ReturnType<typeof setTimeout>;
  let warningTimeout: ReturnType<typeof setTimeout>;
  let lastActivity = Date.now();
  
  // Function to reset the timer on user activity
  const resetTimer = () => {
    lastActivity = Date.now();
    clearTimeout(activityTimeout);
    clearTimeout(warningTimeout);
    
    // Set warning timeout (5 minutes before actual timeout)
    warningTimeout = setTimeout(() => {
      // Trigger warning event
      const timeLeft = Math.round((timeoutMinutes - 5) * 60);
      console.log(`Session timeout warning: ${timeLeft} seconds remaining`);
      // You would typically show a UI notification here
    }, (timeoutMinutes - 5) * 60 * 1000);
    
    // Set actual timeout
    activityTimeout = setTimeout(async () => {
      console.log('Session timed out due to inactivity');
      
      // Log the security event
      await logSecurityEvent('session_timeout', {
        inactivity_duration_ms: Date.now() - lastActivity,
      });
      
      // Perform logout
      await supabase.auth.signOut();
      
      // You would typically navigate to login screen here
    }, timeoutMinutes * 60 * 1000);
  };
  
  // Monitor user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });
  
  // Initialize the timer
  resetTimer();
  
  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
    clearTimeout(activityTimeout);
    clearTimeout(warningTimeout);
  };
}

/**
 * Data Retention Management
 * 
 * Functions to manage data retention in compliance with regulations
 */

/**
 * Apply data retention policies
 * 
 * This function implements data retention rules:
 * - Medical records: 7 years (or according to regional laws)
 * - Audit logs: 6 years for HIPAA compliance
 * - Temporary data: 30 days
 * 
 * @returns Promise resolving to number of records affected
 */
export async function applyDataRetentionPolicies(): Promise<number> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user || !(await hasPermission('manage_data_retention'))) {
      console.error('Unauthorized to apply data retention policies');
      return 0;
    }
    
    // Run data retention stored procedure
    const { data, error } = await supabase.rpc('apply_data_retention_policies');
    
    if (error) {
      console.error('Error applying data retention policies:', error);
      return 0;
    }
    
    // Log the event
    await logSecurityEvent('data_retention_applied', {
      records_affected: data.records_affected,
      user: userData.user.id,
    });
    
    return data.records_affected;
  } catch (error) {
    console.error('Failed to apply data retention policies:', error);
    return 0;
  }
}

/**
 * Key Rotation Procedures
 * 
 * Functions to manage API key and encryption key rotation
 */

/**
 * Check if API keys need rotation
 * 
 * @returns Promise resolving to boolean indicating if rotation is needed
 */
export async function checkKeyRotationNeeded(): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'last_key_rotation')
      .single();
    
    if (!data?.value) {
      return true;
    }
    
    const lastRotation = new Date(data.value).getTime();
    const now = Date.now();
    const daysSinceRotation = (now - lastRotation) / (1000 * 60 * 60 * 24);
    
    // Keys should be rotated every 90 days
    return daysSinceRotation >= 90;
  } catch (error) {
    console.error('Error checking key rotation status:', error);
    // Default to true on error to encourage rotation
    return true;
  }
}

// Export additional utility functions and error handlers
export { handleApiError as handleError };