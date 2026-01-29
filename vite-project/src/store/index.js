import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        expense: expenseReducer,
    },
});

export default store;
