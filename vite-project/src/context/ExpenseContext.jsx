import React, { createContext, useReducer, useCallback } from 'react';

export const ExpenseContext = createContext();

const initialState = {
    expenses: [],
    loading: false,
    error: null,
    totalAmount: 0,
};

export const expenseReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null,
            };

        case 'FETCH_SUCCESS':
            const fetchedExpenses = action.payload || [];
            const totalFetched = fetchedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
            return {
                ...state,
                expenses: fetchedExpenses,
                totalAmount: totalFetched,
                loading: false,
                error: null,
            };

        case 'FETCH_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case 'ADD_EXPENSE':
            const newExpenses = [action.payload, ...state.expenses];
            const newTotal = state.totalAmount + (parseFloat(action.payload.amount) || 0);
            return {
                ...state,
                expenses: newExpenses,
                totalAmount: newTotal,
            };

        case 'UPDATE_EXPENSE':
            const updatedExpenses = state.expenses.map((exp) =>
                exp.id === action.payload.id ? { ...exp, ...action.payload.data } : exp
            );
            // Recalculate total
            const updatedTotal = updatedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
            return {
                ...state,
                expenses: updatedExpenses,
                totalAmount: updatedTotal,
            };

        case 'DELETE_EXPENSE':
            const remainingExpenses = state.expenses.filter((exp) => exp.id !== action.payload);
            const remainingTotal = remainingExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
            return {
                ...state,
                expenses: remainingExpenses,
                totalAmount: remainingTotal,
            };

        case 'CLEAR_EXPENSES':
            return {
                ...state,
                expenses: [],
                totalAmount: 0,
            };

        default:
            return state;
    }
};

export const ExpenseProvider = ({ children }) => {
    const [state, dispatch] = useReducer(expenseReducer, initialState);

    const addExpense = useCallback((expense) => {
        dispatch({
            type: 'ADD_EXPENSE',
            payload: expense,
        });
    }, []);

    const updateExpense = useCallback((id, data) => {
        dispatch({
            type: 'UPDATE_EXPENSE',
            payload: { id, data },
        });
    }, []);

    const deleteExpense = useCallback((id) => {
        dispatch({
            type: 'DELETE_EXPENSE',
            payload: id,
        });
    }, []);

    const setExpenses = useCallback((expenses) => {
        dispatch({
            type: 'FETCH_SUCCESS',
            payload: expenses,
        });
    }, []);

    const clearExpenses = useCallback(() => {
        dispatch({
            type: 'CLEAR_EXPENSES',
        });
    }, []);

    const value = {
        ...state,
        addExpense,
        updateExpense,
        deleteExpense,
        setExpenses,
        clearExpenses,
        dispatch,
    };

    return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpense = () => {
    const context = React.useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
};
