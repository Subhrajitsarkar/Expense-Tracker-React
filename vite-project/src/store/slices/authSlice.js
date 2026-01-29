import { createSlice } from '@reduxjs/toolkit';

//This is the default state for your authentication feature. When the app first loads (before any login or session restoration), this is what the auth part of your Redux store looks like.
const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    userId: null,
    loading: false,
    error: null,
    sessionRestored: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.loading = false;
            state.error = null;
            localStorage.setItem('firebaseToken', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('userId', action.payload.userId);
        },
        loginFailure: (state, action) => {
            state.isAuthenticated = false;
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.userId = null;
            state.error = null;
            state.sessionRestored = false;
            localStorage.removeItem('firebaseToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
        },
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        sessionRestoreStart: (state) => {
            state.loading = true;
        },
        restoreSession: (state, action) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.sessionRestored = true;
            state.loading = false;
        },
        sessionRestoreFailure: (state) => {
            state.sessionRestored = true;
            state.loading = false;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    restoreSession,
    sessionRestoreStart,
    sessionRestoreFailure,
} = authSlice.actions;

export default authSlice.reducer;
