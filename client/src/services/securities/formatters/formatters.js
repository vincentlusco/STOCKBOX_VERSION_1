/**
 * Base formatting utilities for consistent data presentation
 */

/**
 * Format currency values
 * @param {number} value - The value to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

/**
 * Format percentage values
 * @param {number} value - The value to format
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`;
};

/**
 * Format numeric values with optional decimal places
 * @param {number} value - The value to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Format date values
 * @param {string|number|Date} value - The date value to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US');
};

/**
 * Format volume numbers
 * @param {number} value - The volume to format
 * @returns {string} Formatted volume string
 */
export const formatVolume = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format market cap values
 * @param {number} value - The value to format
 * @returns {string} Formatted market cap string
 */
export const formatMarketCap = (value) => {
    if (typeof value !== 'number') {
        return 'N/A';
    }

    if (value >= 1.0e+12) {
        return (value / 1.0e+12).toFixed(2) + 'T';
    } else if (value >= 1.0e+9) {
        return (value / 1.0e+9).toFixed(2) + 'B';
    } else if (value >= 1.0e+6) {
        return (value / 1.0e+6).toFixed(2) + 'M';
    } else if (value >= 1.0e+3) {
        return (value / 1.0e+3).toFixed(2) + 'K';
    }

    return value.toFixed(2);
};

/**
 * Format change values with color and arrow
 * @param {number} value - The change value
 * @param {boolean} [includeSign=true] - Whether to include +/- sign
 * @returns {string} Formatted change string
 */
export const formatChange = (value, includeSign = true) => {
    if (value === null || value === undefined) return 'N/A';
    
    const arrow = value >= 0 ? '▲' : '▼';
    const sign = includeSign ? (value >= 0 ? '+' : '') : '';
    
    return `${arrow} ${sign}${value.toFixed(2)}`;
};