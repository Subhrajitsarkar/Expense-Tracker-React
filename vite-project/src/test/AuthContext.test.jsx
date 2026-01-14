import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React, { useReducer } from 'react';
import { AuthContext, authReducer } from '../context/AuthContext';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AuthContext Reducer Tests', () => {
  // Test 11: Login start action
  it('should handle LOGIN_START action correctly', () => {
    const initialState = {
      isAuthenticated: false,
      user: null,
      token: null,
      userId: null,
      loading: false,
      error: null,
    };

    const action = { type: 'LOGIN_START' };
    const newState = authReducer(initialState, action);

    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(null);
    expect(newState.isAuthenticated).toBe(false);
  });

  // Test 12: Login success action
  it('should handle LOGIN_SUCCESS action correctly', () => {
    const initialState = {
      isAuthenticated: false,
      user: null,
      token: null,
      userId: null,
      loading: true,
      error: null,
    };

    const payload = {
      user: { email: 'test@example.com' },
      token: 'auth-token-123',
      userId: 'user-123',
    };

    const action = { type: 'LOGIN_SUCCESS', payload };
    const newState = authReducer(initialState, action);

    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).toEqual(payload.user);
    expect(newState.token).toBe(payload.token);
    expect(newState.userId).toBe(payload.userId);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(null);
  });

  // Test 13: Login failure action
  it('should handle LOGIN_FAILURE action correctly', () => {
    const initialState = {
      isAuthenticated: true,
      user: { email: 'test@example.com' },
      token: 'auth-token-123',
      userId: 'user-123',
      loading: true,
      error: null,
    };

    const errorMessage = 'Invalid credentials';
    const action = { type: 'LOGIN_FAILURE', payload: errorMessage };
    const newState = authReducer(initialState, action);

    expect(newState.isAuthenticated).toBe(false);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
    // Token and userId are not cleared by LOGIN_FAILURE in the reducer
    expect(newState.token).toBe('auth-token-123');
    expect(newState.userId).toBe('user-123');
  });

  // Test 14: Logout action
  it('should handle LOGOUT action correctly', () => {
    const initialState = {
      isAuthenticated: true,
      user: { email: 'test@example.com' },
      token: 'auth-token-123',
      userId: 'user-123',
      loading: false,
      error: null,
    };

    const action = { type: 'LOGOUT' };
    const newState = authReducer(initialState, action);

    expect(newState.isAuthenticated).toBe(false);
    expect(newState.user).toBe(null);
    expect(newState.token).toBe(null);
    expect(newState.userId).toBe(null);
    expect(newState.error).toBe(null);
  });

  // Test 15: Update user action
  it('should handle UPDATE_USER action correctly', () => {
    const initialState = {
      isAuthenticated: true,
      user: {
        email: 'test@example.com',
        fullName: '',
        profilePhotoUrl: '',
      },
      token: 'auth-token-123',
      userId: 'user-123',
      loading: false,
      error: null,
    };

    const payload = {
      fullName: 'John Doe',
      profilePhotoUrl: 'https://example.com/photo.jpg',
    };

    const action = { type: 'UPDATE_USER', payload };
    const newState = authReducer(initialState, action);

    expect(newState.user.fullName).toBe('John Doe');
    expect(newState.user.profilePhotoUrl).toBe('https://example.com/photo.jpg');
    expect(newState.user.email).toBe('test@example.com');
    expect(newState.isAuthenticated).toBe(true);
  });
});

// Test component using AuthContext
const TestComponent = () => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    userId: null,
    loading: false,
    error: null,
  });

  return (
    <div>
      <div data-testid="auth-status">
        {state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{state.user?.email || 'No user'}</div>
      <button
        onClick={() =>
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: { email: 'test@example.com' },
              token: 'token',
              userId: 'user-123',
            },
          })
        }
      >
        Login
      </button>
      <button onClick={() => dispatch({ type: 'LOGOUT' })}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 16: Auth context dispatch updates component state
  it('should update component state when login action is dispatched', async () => {
    render(<TestComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  // Test 17: Logout clears authentication state
  it('should clear auth state when logout action is dispatched', async () => {
    render(<TestComponent />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  // Test 18: Multiple consecutive login/logout actions
  it('should handle multiple login/logout cycles correctly', async () => {
    render(<TestComponent />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    const logoutButton = screen.getByRole('button', { name: /logout/i });

    // First cycle
    loginButton.click();
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    logoutButton.click();
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Second cycle
    loginButton.click();
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });

  // Test 19: Auth state preserves user data correctly
  it('should preserve user data through state updates', async () => {
    render(<TestComponent />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Verify user data persists
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  // Test 20: Auth reducer handles edge cases
  it('should handle unknown action types gracefully', () => {
    const initialState = {
      isAuthenticated: false,
      user: null,
      token: null,
      userId: null,
      loading: false,
      error: null,
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const newState = authReducer(initialState, action);

    // Should return initial state for unknown actions
    expect(newState).toEqual(initialState);
  });
});
