const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const configDir = path.join(process.env.HOME, '.stockbox_config');
const configPath = path.join(configDir, 'keys.js');

const requiredKeys = [
    'YAHOO_FINANCE_KEY',
    'ALPHA_VANTAGE_KEY',
    'FINNHUB_KEY',
    'FMP_KEY'
];

const setup = async () => {
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const keys = {};

    console.log('Please enter your API keys:');

    for (const key of requiredKeys) {
        const value = await new Promise(resolve => {
            rl.question(`${key}: `, resolve);
        });
        keys[key] = value;
    }

    const configContent = `module.exports = ${JSON.stringify(keys, null, 2)};`;
    fs.writeFileSync(configPath, configContent);

    console.log(`\nConfiguration saved to ${configPath}`);
    rl.close();
};

setup().catch(console.error); 