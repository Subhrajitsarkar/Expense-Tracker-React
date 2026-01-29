import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice';

const initialState = {
    expenses: [],
    loading: false,
    error: null,
    totalAmount: 0,
};

const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        fetchStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            const fetchedExpenses = action.payload || [];
            const totalFetched = fetchedExpenses.reduce(
                (sum, exp) => sum + (parseFloat(exp.amount) || 0),
                0
            );
            state.expenses = fetchedExpenses;
            state.totalAmount = totalFetched;
            state.loading = false;
            state.error = null;
        },
        fetchFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addExpense: (state, action) => {
            state.expenses.unshift(action.payload);
            state.totalAmount += parseFloat(action.payload.amount) || 0;
        },
        updateExpense: (state, action) => {
            const { id, data } = action.payload;
            const expenseIndex = state.expenses.findIndex((exp) => exp.id === id);
            if (expenseIndex !== -1) {
                const oldAmount = parseFloat(state.expenses[expenseIndex].amount) || 0;
                const newAmount = parseFloat(data.amount) || oldAmount;
                state.expenses[expenseIndex] = {
                    ...state.expenses[expenseIndex],
                    ...data,
                };
                state.totalAmount = state.totalAmount - oldAmount + newAmount;
            }
        },
        deleteExpense: (state, action) => {
            const expenseIndex = state.expenses.findIndex(
                (exp) => exp.id === action.payload
            );
            if (expenseIndex !== -1) {
                const deletedExpense = state.expenses[expenseIndex];
                state.totalAmount -= parseFloat(deletedExpense.amount) || 0;
                state.expenses.splice(expenseIndex, 1);
            }
        },
        clearExpenses: (state) => {
            state.expenses = [];
            state.totalAmount = 0;
        },
        setExpenses: (state, action) => {
            const fetchedExpenses = action.payload || [];
            const totalFetched = fetchedExpenses.reduce(
                (sum, exp) => sum + (parseFloat(exp.amount) || 0),
                0
            );
            state.expenses = fetchedExpenses;
            state.totalAmount = totalFetched;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, (state) => {
            state.expenses = [];
            state.totalAmount = 0;
            state.loading = false;
            state.error = null;
        });
    },
});

export const {
    fetchStart,
    fetchSuccess,
    fetchFailure,
    addExpense,
    updateExpense,
    deleteExpense,
    clearExpenses,
    setExpenses,
} = expenseSlice.actions;

export default expenseSlice.reducer;
