import React, { createContext, useReducer, useCallback, useEffect } from 'react';

export const ThemeContext = createContext();

const initialState = {
    theme: 'light', // 'light' or 'dark'
    isDark: false,
};

export const themeReducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_THEME':
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            return {
                ...state,
                theme: newTheme,
                isDark: newTheme === 'dark',
            };

        case 'SET_THEME':
            return {
                ...state,
                theme: action.payload,
                isDark: action.payload === 'dark',
            };

        default:
            return state;
    }
};

export const ThemeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(themeReducer, initialState);

    // Restore theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            dispatch({
                type: 'SET_THEME',
                payload: savedTheme,
            });
        }
    }, []);

    // Apply theme to document when it changes
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', state.theme);
        localStorage.setItem('appTheme', state.theme);
    }, [state.theme]);

    const toggleTheme = useCallback(() => {
        dispatch({ type: 'TOGGLE_THEME' });
    }, []);

    const setTheme = useCallback((theme) => {
        dispatch({
            type: 'SET_THEME',
            payload: theme,
        });
    }, []);

    const value = {
        ...state,
        toggleTheme,
        setTheme,
        dispatch,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
