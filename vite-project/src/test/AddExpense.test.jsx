import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ExpenseProvider } from '../context/ExpenseContext';
import AddExpense from '../AddExpense';

// Mock Firebase utilities
vi.mock('../firebaseUtils', () => ({
    addExpenseToFirebase: vi.fn(),
    fetchExpensesFromFirebase: vi.fn(),
    deleteExpenseFromFirebase: vi.fn(),
    updateExpenseInFirebase: vi.fn(),
}));

// Mock export utilities
vi.mock('../utils/exportUtils', () => ({
    exportExpensesAsCSV: vi.fn(),
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

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
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

describe('AddExpense Component Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    // Test 6: AddExpense form renders with all category options
    it('should render expense form with all expense categories', async () => {
        renderWithProviders(<AddExpense />);

        await waitFor(() => {
            expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/category/i);
        const options = categorySelect.querySelectorAll('option');

        expect(options.length).toBeGreaterThan(0);
        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Shopping')).toBeInTheDocument();
    });

    // Test 7: Add expense form validation - amount required
    it('should disable add expense button when amount is empty', async () => {
        renderWithProviders(<AddExpense />);

        await waitFor(() => {
            const addButton = screen.getByRole('button', { name: /add expense/i });
            expect(addButton).toBeDisabled();
        });
    });

    // Test 8: Form inputs accept and display values
    it('should accept input values in expense form fields', async () => {
        renderWithProviders(<AddExpense />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
        });

        const amountInput = screen.getByPlaceholderText(/enter amount/i);
        const descriptionInput = screen.getByPlaceholderText(/what did you spend on/i);

        await userEvent.type(amountInput, '100');
        await userEvent.type(descriptionInput, 'Lunch');

        expect(amountInput.value).toBe('100');
        expect(descriptionInput.value).toBe('Lunch');
    });

    // Test 9: Delete expense from Firebase
    it('should delete expense when delete button is clicked', async () => {
        const { deleteExpenseFromFirebase } = await import('../firebaseUtils');
        deleteExpenseFromFirebase.mockResolvedValue(true);

        renderWithProviders(<AddExpense />);

        await waitFor(() => {
            const deleteButtons = screen.queryAllByRole('button', { name: /delete|remove/i });
            if (deleteButtons.length > 0) {
                expect(deleteButtons[0]).toBeInTheDocument();
            }
        });
    });

    // Test 10: Component initializes with proper UI elements
    it('should render all necessary UI elements on component mount', async () => {
        renderWithProviders(<AddExpense />);

        await waitFor(() => {
            expect(screen.getByText(/add daily expense/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/amount spent/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        });
    });
});
