const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const requiredKeys = [
    'REACT_APP_FMP_API_KEY',
    'REACT_APP_NEWS_API_KEY'
];

const loadApiKeys = () => {
    // First try environment variables
    const envKeys = {};
    const missingKeys = [];

    requiredKeys.forEach(key => {
        if (process.env[key]) {
            envKeys[key] = process.env[key];
        } else {
            missingKeys.push(key);
        }
    });

    // If all keys found in env, return them
    if (missingKeys.length === 0) {
        return envKeys;
    }

    // Try loading from config file
    const configPath = path.join(process.env.HOME, '.stockbox_config', 'keys.js');
    
    try {
        if (fs.existsSync(configPath)) {
            const configKeys = require(configPath);
            missingKeys.forEach(key => {
                if (configKeys[key]) {
                    envKeys[key] = configKeys[key];
                }
            });
        }
    } catch (error) {
        console.error('Error loading config file:', error);
    }

    // Check if we still have missing keys
    const stillMissing = requiredKeys.filter(key => !envKeys[key]);
    
    if (stillMissing.length > 0) {
        const errorMessage = [
            'API keys not found. Please either:',
            '1. Set environment variables in .env file:',
            ...stillMissing.map(key => `   ${key}=your_key_here`),
            '2. Or create a config file at:',
            `   ${configPath}`,
            'with the following structure:',
            'module.exports = {',
            ...stillMissing.map(key => `   ${key}: "your_key_here",`),
            '};'
        ].join('\n');

        throw new Error(errorMessage);
    }

    return envKeys;
};

const apiKeys = loadApiKeys();

module.exports = apiKeys; 