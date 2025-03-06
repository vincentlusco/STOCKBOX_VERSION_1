export function validateAndSanitizeData(data, schema) {
    if (!data) return null;

    const sanitized = {};
    for (const [key, validator] of Object.entries(schema)) {
        if (data[key] !== undefined) {
            try {
                sanitized[key] = validator(data[key]);
            } catch (error) {
                logger.warn(`Validation failed for ${key}:`, error);
            }
        }
    }
    return sanitized;
}

export const schemas = {
    price: {
        current: (v) => Number(v),
        change: (v) => Number(v),
        changePercent: (v) => Number(v),
        volume: (v) => parseInt(v),
        timestamp: (v) => new Date(v).getTime()
    },
    // Add other schemas...
}; 