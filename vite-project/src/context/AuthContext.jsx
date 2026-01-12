import React, { createContext, useReducer, useCallback } from 'react';

export const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    userId: null,
    loading: false,
    error: null,
};

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };

        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                userId: action.payload.userId,
                loading: false,
                error: null,
            };

        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };

        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                userId: null,
                error: null,
            };

        case 'UPDATE_USER':
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload,
                },
            };

        case 'RESTORE_SESSION':
            return {
                ...state,
                isAuthenticated: action.payload.isAuthenticated,
                user: action.payload.user,
                token: action.payload.token,
                userId: action.payload.userId,
            };

        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Restore session from localStorage on mount
    React.useEffect(() => {
        const token = localStorage.getItem('firebaseToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                dispatch({
                    type: 'RESTORE_SESSION',
                    payload: {
                        isAuthenticated: true,
                        user,
                        token,
                        userId: user.userId,
                    },
                });
            } catch (err) {
                console.error('Failed to restore session:', err);
                localStorage.removeItem('firebaseToken');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const login = useCallback((user, token, userId) => {
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token, userId },
        });
        localStorage.setItem('firebaseToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
    }, []);

    const logout = useCallback(() => {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('userData');
    }, []);

    const updateUser = useCallback((userData) => {
        dispatch({
            type: 'UPDATE_USER',
            payload: userData,
        });
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            const user = JSON.parse(storedData);
            localStorage.setItem('userData', JSON.stringify({ ...user, ...userData }));
        }
    }, []);

    const value = {
        ...state,
        login,
        logout,
        updateUser,
        dispatch,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
