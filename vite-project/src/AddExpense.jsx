import React, { useState, useEffect } from 'react';
import { addExpenseToFirebase, fetchExpensesFromFirebase, deleteExpenseFromFirebase, updateExpenseInFirebase } from './firebaseUtils';
import { useAuth } from './context/AuthContext';
import { useExpense } from './context/ExpenseContext';
import { exportExpensesAsCSV } from './utils/exportUtils';

const AddExpense = () => {
    const { token, userId } = useAuth();
    const { expenses, totalAmount, addExpense, updateExpense, deleteExpense, setExpenses } = useExpense();
    const [isPremiumActive, setIsPremiumActive] = useState(false);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [error, setError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('Food');
    const [editLoading, setEditLoading] = useState(false);

    const expenseCategories = [
        'Food',
        'Petrol',
        'Salary',
        'Entertainment',
        'Utilities',
        'Shopping',
        'Transportation',
        'Healthcare',
        'Education',
        'Other'
    ];

    // Load expenses from Firebase on component mount
    useEffect(() => {
        const load = async () => {
            setFetchLoading(true);
            try {
                if (!userId) {
                    // No user id available, fallback to localStorage key
                    const savedExpenses = localStorage.getItem('userExpenses');
                    if (savedExpenses) {
                        setExpenses(JSON.parse(savedExpenses));
                    }
                    setFetchLoading(false);
                    return;
                }

                const items = await fetchExpensesFromFirebase(userId, token);
                if (items && items.length) {
                    const normalizedExpenses = items.map(it => ({
                        ...it,
                        // ensure numeric amount
                        amount: typeof it.amount === 'number' ? it.amount : parseFloat(it.amount || 0)
                    }));
                    setExpenses(normalizedExpenses);
                }
            } catch (err) {
                console.error('Failed to load expenses:', err);
                setError('Failed to load expenses');
            } finally {
                setFetchLoading(false);
            }
        };

        load();
    }, [userId, token, setExpenses]);

    const isFormValid = amount && description.trim() && category;

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError('');

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }

        const newExpense = {
            amount: parseFloat(amount),
            description: description.trim(),
            category: category,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
        };

        setAddLoading(true);
        try {
            if (userId) {
                const saved = await addExpenseToFirebase(userId, newExpense, token);
                addExpense(saved);
            } else {
                // fallback to localStorage if not authenticated
                const temp = { id: Date.now().toString(), ...newExpense };
                addExpense(temp);
                const updatedExpenses = [temp, ...expenses];
                localStorage.setItem('userExpenses', JSON.stringify(updatedExpenses));
            }

            // Reset form
            setAmount('');
            setDescription('');
            setCategory('Food');
        } catch (err) {
            console.error('Failed to add expense:', err);
            setError(err.message || 'Failed to add expense');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            if (userId && id) {
                await deleteExpenseFromFirebase(userId, id, token);
            }

            deleteExpense(id);
            // keep localStorage in sync
            const updatedExpenses = expenses.filter(exp => exp.id !== id);
            localStorage.setItem('userExpenses', JSON.stringify(updatedExpenses));
        } catch (err) {
            console.error('Failed to delete expense:', err);
            setError(err.message || 'Failed to delete expense');
        }
    };

    const handleEditClick = (expense) => {
        setEditingId(expense.id);
        setEditAmount(expense.amount.toString());
        setEditDescription(expense.description);
        setEditCategory(expense.category);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        if (!editDescription.trim()) {
            setError('Please enter a description');
            return;
        }

        const updatedExpenseData = {
            amount: parseFloat(editAmount),
            description: editDescription.trim(),
            category: editCategory,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
        };

        setEditLoading(true);
        try {
            if (userId && editingId) {
                await updateExpenseInFirebase(userId, editingId, updatedExpenseData, token);
                updateExpense(editingId, updatedExpenseData);
            }

            // Close edit modal
            setEditingId(null);
            setEditAmount('');
            setEditDescription('');
            setEditCategory('Food');
        } catch (err) {
            console.error('Failed to update expense:', err);
            setError(err.message || 'Failed to update expense');
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditAmount('');
        setEditDescription('');
        setEditCategory('Food');
        setError('');
    };

    const getTotalExpenses = () => {
        return totalAmount.toFixed(2);
    };

    const getCategoryTotal = (categoryName) => {
        return expenses
            .filter(expense => expense.category === categoryName)
            .reduce((total, expense) => total + expense.amount, 0)
            .toFixed(2);
    };

    const handleActivatePremium = () => {
        setIsPremiumActive(true);
        alert('🎉 Premium activated! You now have access to all premium features!');
    };

    const handleDownloadCSV = () => {
        const fileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        exportExpensesAsCSV(expenses, fileName);
    };

    return (
        <div className="expenses-section">
            <div className="add-expense-container">
                <h2>Add Daily Expense</h2>

                <form onSubmit={handleAddExpense} className="expense-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="amount">Amount Spent (₹)</label>
                            <input
                                type="number"
                                id="amount"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                placeholder="What did you spend on?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {expenseCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="btn-add-expense"
                        disabled={!isFormValid || addLoading}
                    >
                        {addLoading ? 'Adding...' : 'Add Expense'}
                    </button>
                </form>
            </div>

            {fetchLoading ? (
                <div className="loading-text" style={{ padding: '1rem' }}>Loading expenses...</div>
            ) : expenses.length > 0 && (
                <div className="expenses-display-container">
                    <div className="expenses-summary">
                        <h3>Expense Summary</h3>
                        <div className="summary-stats">
                            <div className="stat-box">
                                <span className="stat-label">Total Expenses</span>
                                <span className="stat-value">₹{getTotalExpenses()}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Total Transactions</span>
                                <span className="stat-value">{expenses.length}</span>
                            </div>
                        </div>

                        {totalAmount > 10000 && (
                            <div className="premium-section">
                                <div className="premium-banner">
                                    <span className="premium-icon">👑</span>
                                    <div className="premium-content">
                                        <h4>Unlock Premium Features</h4>
                                        <p>Your total expenses exceed ₹10,000. Activate premium to get:</p>
                                        <ul className="premium-features">
                                            <li>Advanced spending analytics</li>
                                            <li>Budget alerts and notifications</li>
                                            <li>Export expense reports</li>
                                            <li>Multi-currency support</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="premium-actions">
                                    <button
                                        className="btn-activate-premium"
                                        onClick={handleActivatePremium}
                                    >
                                        Activate Premium
                                    </button>
                                    <button
                                        className="btn-download-csv"
                                        onClick={handleDownloadCSV}
                                        title="Download all expenses as CSV"
                                    >
                                        📥 Download CSV
                                    </button>
                                </div>
                            </div>
                        )}

                        {expenses.length > 0 && totalAmount <= 10000 && (
                            <button
                                className="btn-download-csv"
                                onClick={handleDownloadCSV}
                                title="Download all expenses as CSV"
                                style={{ marginTop: '1.5rem', width: '100%' }}
                            >
                                📥 Download CSV
                            </button>
                        )}
                    </div>

                    <div className="expenses-list-container">
                        <h3>Recent Expenses</h3>
                        <div className="expenses-list">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="expense-item">
                                    <div className="expense-icon">
                                        {getCategoryIcon(expense.category)}
                                    </div>
                                    <div className="expense-details">
                                        <div className="expense-main">
                                            <span className="expense-description">{expense.description}</span>
                                            <span className="expense-category">{expense.category}</span>
                                        </div>
                                        <div className="expense-time">
                                            {expense.date} {expense.time}
                                        </div>
                                    </div>
                                    <div className="expense-amount">
                                        <span className="amount">₹{expense.amount.toFixed(2)}</span>
                                        <div className="expense-actions">
                                            <button
                                                className="btn-edit-expense"
                                                onClick={() => handleEditClick(expense)}
                                                title="Edit expense"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="btn-delete-expense"
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                title="Delete expense"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="category-breakdown">
                        <h3>Spending by Category</h3>
                        <div className="category-list">
                            {expenseCategories
                                .filter(cat => getCategoryTotal(cat) > 0)
                                .map((cat) => (
                                    <div key={cat} className="category-item">
                                        <span className="category-name">{cat}</span>
                                        <span className="category-amount">₹{getCategoryTotal(cat)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {expenses.length === 0 && (
                <div className="no-expenses">
                    <p>No expenses added yet. Add your first expense above!</p>
                </div>
            )}

            {editingId && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h2>Edit Expense</h2>
                        <form onSubmit={handleEditSubmit} className="edit-form">
                            <div className="form-group">
                                <label htmlFor="edit-amount">Amount Spent (₹)</label>
                                <input
                                    type="number"
                                    id="edit-amount"
                                    placeholder="Enter amount"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-description">Description</label>
                                <input
                                    type="text"
                                    id="edit-description"
                                    placeholder="What did you spend on?"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-category">Category</label>
                                <select
                                    id="edit-category"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                >
                                    {expenseCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && <p className="error-message">{error}</p>}

                            <div className="modal-buttons">
                                <button
                                    type="submit"
                                    className="btn-submit-edit"
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Updating...' : 'Update Expense'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel-edit"
                                    onClick={handleEditCancel}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const getCategoryIcon = (category) => {
    const icons = {
        'Food': '🍔',
        'Petrol': '⛽',
        'Salary': '💰',
        'Entertainment': '🎬',
        'Utilities': '💡',
        'Shopping': '🛍️',
        'Transportation': '🚗',
        'Healthcare': '🏥',
        'Education': '📚',
        'Other': '📝'
    };
    return icons[category] || '📝';
};

export default AddExpense;
