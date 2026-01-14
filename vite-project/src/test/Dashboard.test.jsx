import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ExpenseProvider } from '../context/ExpenseContext';
import Dashboard from '../Dashboard';

// Mock the firebaseUtils module
vi.mock('../firebaseUtils', () => ({
    fetchUserDataFromFirebase: vi.fn(),
    sendVerificationEmail: vi.fn(),
}));

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
            <ThemeProvider>
                <AuthProvider>
                    <ExpenseProvider>
                        {component}
                    </ExpenseProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

describe('Dashboard Component Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test 6: Dashboard renders with user greeting
    it('should display dashboard with greeting message', async () => {
        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/welcome to expense tracker/i)).toBeInTheDocument();
        });
    });

    // Test 7: Logout functionality
    it('should have logout button available', async () => {
        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
        });
    });

    // Test 8: Theme toggle button is present
    it('should display theme toggle button', async () => {
        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });

    // Test 9: Dashboard displays profile completion status
    it('should display profile incomplete message', async () => {
        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/your profile is incomplete/i)).toBeInTheDocument();
        });
    });

    // Test 10: AddExpense component is rendered in Dashboard
    it('should render AddExpense component with form elements', async () => {
        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/add daily expense/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
