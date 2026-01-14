import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../Login';

// Mock the firebaseUtils module
vi.mock('../firebaseUtils');

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

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  // Test 1: Login form renders correctly
  it('should render login form with email and password inputs', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // Test 2: Submit button is disabled when form is empty
  it('should disable submit button when form fields are empty', () => {
    renderWithProviders(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  // Test 3: Error message displays when API key is missing
  it('should display error when Firebase API Key is not configured', async () => {
    const originalEnv = import.meta.env.VITE_API_KEY;
    import.meta.env.VITE_API_KEY = '';

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/firebase api key is not configured/i)).toBeInTheDocument();
    });

    import.meta.env.VITE_API_KEY = originalEnv;
  });

  // Test 4: Links to signup and forgot password pages are present
  it('should display signup and forgot password links', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  // Test 5: Form submission handling
  it('should handle form submission', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ idToken: 'token123', localId: 'user123' }),
      })
    );

    import.meta.env.VITE_API_KEY = 'test-api-key';

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
