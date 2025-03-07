import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './Settings.css';

const Settings = () => {
    const { theme, updateTheme, userName, setUserName, timezone, setTimezone } = useContext(ThemeContext);

    const handleBackgroundChange = (event) => {
        updateTheme({ background: event.target.value });
    };

    const handleTextColorChange = (event) => {
        updateTheme({ textColor: event.target.value });
    };

    const handleBorderColorChange = (event) => {
        updateTheme({ borderColor: event.target.value });
    };

    const handleNameChange = (event) => {
        setUserName(event.target.value);
    };

    const handleTimezoneChange = (event) => {
        setTimezone(event.target.value);
    };

    return (
        <div className="settings-container" style={{ color: theme.textColor, backgroundColor: theme.background }}>
            <h1>Settings</h1>
            <div className="settings-option">
                <label>Background Color:</label>
                <select value={theme.background} onChange={handleBackgroundChange}>
                    <option value="#000000">Black</option>
                    <option value="#FFFFFF">White</option>
                </select>
            </div>
            <div className="settings-option">
                <label>Text Color:</label>
                <input type="color" value={theme.textColor} onChange={handleTextColorChange} />
            </div>
            <div className="settings-option">
                <label>Border Color:</label>
                <input type="color" value={theme.borderColor} onChange={handleBorderColorChange} />
            </div>
            <div className="settings-option">
                <label>User Name:</label>
                <input type="text" value={userName} onChange={handleNameChange} placeholder="Enter your name" />
            </div>
            <div className="settings-option">
                <label>Timezone:</label>
                <select value={timezone} onChange={handleTimezoneChange}>
                    <option value="Etc/UTC">UTC</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Chicago">Chicago (CST)</option>
                    <option value="America/Denver">Denver (MST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                </select>
            </div>
        </div>
    );
};

export default Settings;