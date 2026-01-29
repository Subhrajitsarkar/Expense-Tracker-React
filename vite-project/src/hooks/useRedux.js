import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, updateUser } from '../store/slices/authSlice';
import { addExpense, updateExpense, deleteExpense, setExpenses, clearExpenses } from '../store/slices/expenseSlice';
import { useCallback } from 'react';

// useAuth Hook is responsible for providing authentication state and actions to your components.
export const useAuth = () => {
    // This is a standard hook from the react-redux library. dispatch function is used to send actions to the store to trigger state changes.
    const dispatch = useDispatch();
    //useSelector allows your component to "select" and read data from the Redux store's state.
    const authState = useSelector((state) => state.auth);

    const login = useCallback((user, token, userId) => {
        dispatch(loginSuccess({ user, token, userId }));
    }, [dispatch]);

    const logoutUser = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    const updateUserData = useCallback((userData) => {
        dispatch(updateUser(userData));
    }, [dispatch]);

    return {
        ...authState,
        login,
        logout: logoutUser,
        updateUser: updateUserData,
    };
};

// Expense hooks
export const useExpense = () => {
    const dispatch = useDispatch();
    const expenseState = useSelector((state) => state.expense);

    const addExpenseAction = useCallback((expense) => {
        dispatch(addExpense(expense));
    }, [dispatch]);

    const updateExpenseAction = useCallback((id, data) => {
        dispatch(updateExpense({ id, data }));
    }, [dispatch]);

    const deleteExpenseAction = useCallback((id) => {
        dispatch(deleteExpense(id));
    }, [dispatch]);

    const setExpensesAction = useCallback((expenses) => {
        dispatch(setExpenses(expenses));
    }, [dispatch]);

    const clearExpensesAction = useCallback(() => {
        dispatch(clearExpenses());
    }, [dispatch]);

    return {
        ...expenseState,
        addExpense: addExpenseAction,
        updateExpense: updateExpenseAction,
        deleteExpense: deleteExpenseAction,
        setExpenses: setExpensesAction,
        clearExpenses: clearExpensesAction,
    };
};
