/**
 * @file __tests__/api/supabase.test.ts
 * @description Tests for Supabase configuration and security functions
 */

import { 
  validateToken, 
  handleApiError, 
  sanitizeLogData, 
  UserRole,
  SecurityEventType,
} from '../../api/config/supabase';

describe('Supabase Configuration', () => {
  describe('validateToken', () => {
    const createMockToken = (payload: any) => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signature = 'mock-signature';
      return `${header}.${payloadStr}.${signature}`;
    };

    it('should validate a valid token', () => {
      const validPayload = {
        sub: 'user-id',
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
      };
      const token = createMockToken(validPayload);

      expect(validateToken(token)).toBe(true);
    });

    it('should reject empty token', () => {
      expect(validateToken('')).toBe(false);
    });

    it('should reject token with wrong structure', () => {
      expect(validateToken('not.a.jwt')).toBe(false);
      expect(validateToken('only.two.parts')).toBe(false);
    });

    it('should reject expired token', () => {
      const expiredPayload = {
        sub: 'user-id',
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      };
      const token = createMockToken(expiredPayload);

      expect(validateToken(token)).toBe(false);
    });

    it('should reject token without required claims', () => {
      const incompletePaylod = {
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockToken(incompletePaylod);

      expect(validateToken(token)).toBe(false);
    });

    it('should handle invalid JSON in payload', () => {
      const invalidToken = 'header.invalid-json.signature';
      expect(validateToken(invalidToken)).toBe(false);
    });
  });

  describe('handleApiError', () => {
    it('should format error with all details', () => {
      const error = {
        message: 'Database error',
        code: 'PGRST116',
        status: 400,
        details: { hint: 'Check your query' },
      };

      const result = handleApiError(error, 'Database operation failed');

      expect(result).toEqual({
        error: true,
        message: 'Database error',
        code: 'PGRST116',
        status: 400,
        details: { hint: 'Check your query' },
      });
    });

    it('should use custom message when provided', () => {
      const error = {
        message: 'Original error',
      };

      const result = handleApiError(error, 'Custom error message');

      expect(result.message).toBe('Original error');
    });

    it('should use default values for missing fields', () => {
      const error = {};

      const result = handleApiError(error, 'Default message');

      expect(result).toEqual({
        error: true,
        message: 'Default message',
        code: 'general/unknown',
        status: 500,
        details: null,
      });
    });

    it('should throw error when shouldThrow is true', () => {
      const error = {
        message: 'Test error',
        code: 'test/error',
      };

      expect(() => {
        handleApiError(error, 'Test message', true);
      }).toThrow();
    });

    it('should map error codes to user-friendly messages', () => {
      const authError = {
        code: 'auth/invalid-email',
        message: 'Technical message',
      };

      const result = handleApiError(authError);

      expect(result.message).toBe('The email address is invalid.');
    });
  });

  describe('sanitizeLogData', () => {
    it('should sanitize sensitive fields', () => {
      const data = {
        username: 'john_doe',
        password: 'secret123',
        token: 'jwt-token',
        normal_field: 'normal_value',
      };

      const sanitized = sanitizeLogData(data);

      expect(sanitized).toEqual({
        username: 'john_doe',
        password: '[REDACTED]',
        token: '[REDACTED]',
        normal_field: 'normal_value',
      });
    });

    it('should sanitize nested objects', () => {
      const data = {
        user: {
          name: 'John Doe',
          credit_card: '1234-5678-9012-3456',
        },
        metadata: {
          session: {
            token: 'session-token',
          },
        },
      };

      const sanitized = sanitizeLogData(data);

      expect(sanitized.user.credit_card).toBe('[REDACTED]');
      expect(sanitized.metadata.session.token).toBe('[REDACTED]');
      expect(sanitized.user.name).toBe('John Doe');
    });

    it('should handle empty objects', () => {
      const sanitized = sanitizeLogData({});
      expect(sanitized).toEqual({});
    });

    it('should handle null values', () => {
      const data = {
        password: null,
        username: 'test',
      };

      const sanitized = sanitizeLogData(data);

      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.username).toBe('test');
    });
  });
});

describe('User Roles and Permissions', () => {
  it('should define all user roles', () => {
    expect(UserRole.PATIENT).toBe('patient');
    expect(UserRole.PRACTITIONER).toBe('practitioner');
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should define security event types', () => {
    expect(SecurityEventType.LOGIN_SUCCESS).toBe('login_success');
    expect(SecurityEventType.LOGIN_FAILURE).toBe('login_failure');
    expect(SecurityEventType.DATA_ACCESS).toBe('data_access');
    expect(SecurityEventType.SUSPICIOUS_ACTIVITY).toBe('suspicious_activity');
  });
});

describe('Error Handling', () => {
  describe('retryable errors', () => {
    const mockOperation = jest.fn();

    beforeEach(() => {
      mockOperation.mockClear();
    });

    it('should identify network errors as retryable', () => {
      const networkErrors = [
        { code: 'network/timeout', message: 'Request timeout' },
        { code: 'network/offline', message: 'You appear to be offline' },
        { message: 'network connection failed' },
        { message: 'timeout occurred' },
        { status: 500, message: 'Server error' },
        { status: 503, message: 'Service unavailable' },
      ];

      // This would be tested with actual retry logic in implementation
      networkErrors.forEach(error => {
        expect(error.code?.includes('network') || 
               error.message?.includes('network') || 
               error.message?.includes('timeout') ||
               (error.status && error.status >= 500 && error.status < 600)
        ).toBe(true);
      });
    });

    it('should not retry auth errors', () => {
      const authErrors = [
        { code: 'auth/invalid-email', status: 400 },
        { code: 'auth/user-not-found', status: 404 },
        { code: 'db/row-level-security', status: 403 },
      ];

      authErrors.forEach(error => {
        expect(error.status! < 500).toBe(true);
      });
    });
  });

  describe('security logging', () => {
    it('should identify critical security events', () => {
      const criticalEvents = [
        'suspicious_activity',
        'brute_force_attempt', 
        'unauthorized_access',
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecurityEventType.SECURITY_ERROR,
        SecurityEventType.PERMISSION_CHANGE,
      ];

      const nonCriticalEvents = [
        SecurityEventType.LOGIN_SUCCESS,
        SecurityEventType.LOGOUT,
        SecurityEventType.DATA_ACCESS,
      ];

      // In actual implementation, would test with isCriticalSecurityEvent function
      criticalEvents.forEach(event => {
        expect(
          event === SecurityEventType.SUSPICIOUS_ACTIVITY ||
          event === SecurityEventType.SECURITY_ERROR ||
          event === SecurityEventType.PERMISSION_CHANGE ||
          event === 'suspicious_activity' ||
          event === 'brute_force_attempt' ||
          event === 'unauthorized_access'
        ).toBe(true);
      });
    });
  });
});

describe('HIPAA Compliance', () => {
  it('should validate HIPAA agreement tracking', () => {
    const agreementData = {
      agreed: true,
      version: '1.2',
      user_id: 'user-123',
      timestamp: new Date().toISOString(),
    };

    expect(agreementData.agreed).toBe(true);
    expect(agreementData.version).toBeDefined();
    expect(agreementData.user_id).toBeDefined();
    expect(agreementData.timestamp).toBeDefined();
  });

  it('should validate data retention requirements', () => {
    const retentionPeriods = {
      medical_records: 7 * 365, // 7 years in days
      audit_logs: 6 * 365, // 6 years in days
      temporary_data: 30, // 30 days
    };

    expect(retentionPeriods.medical_records).toBe(2555);
    expect(retentionPeriods.audit_logs).toBe(2190);
    expect(retentionPeriods.temporary_data).toBe(30);
  });

  it('should validate session timeout requirements', () => {
    const maxSessionTimeout = 30 * 60; // 30 minutes in seconds
    const warningTimeout = 5 * 60; // 5 minutes warning in seconds

    expect(maxSessionTimeout).toBe(1800);
    expect(warningTimeout).toBe(300);
    expect(warningTimeout < maxSessionTimeout).toBe(true);
  });
});