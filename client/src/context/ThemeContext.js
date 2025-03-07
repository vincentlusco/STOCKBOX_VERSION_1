import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
        background: '#000000',
        textColor: '#00FF00',
        borderColor: '#00FF00'
    });

    const [userName, setUserName] = useState(''); // Add state for user's name
    const [timezone, setTimezone] = useState('Etc/UTC'); // Add state for timezone

    const updateTheme = (newTheme) => {
        setTheme((prevTheme) => ({
            ...prevTheme,
            ...newTheme
        }));
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--background-color', theme.background);
        document.documentElement.style.setProperty('--text-color', theme.textColor);
        document.documentElement.style.setProperty('--border-color', theme.borderColor);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, userName, setUserName, timezone, setTimezone }}>
            {children}
        </ThemeContext.Provider>
    );
};

export { ThemeContext, ThemeProvider };