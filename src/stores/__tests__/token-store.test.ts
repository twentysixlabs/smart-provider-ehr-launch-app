import { beforeEach, describe, expect, it } from 'vitest';
import type { TokenData } from '@/types';
import { useTokenStore } from '../token-store';

describe('tokenStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTokenStore.getState().clearToken();
  });

  it('should initialize with null token', () => {
    const { token } = useTokenStore.getState();
    expect(token).toBeNull();
  });

  it('should set token correctly', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
      patient: 'patient-123',
    };

    useTokenStore.getState().setToken(mockToken);
    const { token } = useTokenStore.getState();

    expect(token).toBeDefined();
    expect(token?.access_token).toBe('test-token');
    expect(token?.patient).toBe('patient-123');
    expect(token?.token_expiry).toBeDefined();
  });

  it('should update token correctly', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    useTokenStore.getState().setToken(mockToken);
    useTokenStore.getState().updateToken({ patient: 'new-patient' });

    const { token } = useTokenStore.getState();
    expect(token?.patient).toBe('new-patient');
    expect(token?.access_token).toBe('test-token');
  });

  it('should clear token correctly', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    useTokenStore.getState().setToken(mockToken);
    useTokenStore.getState().clearToken();

    const { token } = useTokenStore.getState();
    expect(token).toBeNull();
  });

  it('should detect expired token', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: -1, // Expired
    };

    useTokenStore.getState().setToken(mockToken);
    const isExpired = useTokenStore.getState().isTokenExpired();

    expect(isExpired).toBe(true);
  });

  it('should calculate time until expiry', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    useTokenStore.getState().setToken(mockToken);
    const timeRemaining = useTokenStore.getState().getTimeUntilExpiry();

    expect(timeRemaining).toBeGreaterThan(0);
    expect(timeRemaining).toBeLessThanOrEqual(3600 * 1000);
  });
});
