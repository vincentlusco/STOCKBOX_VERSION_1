/**
 * Cleans and processes insider transactions data.
 * @param {Object} data - The raw data to be cleaned.
 * @returns {Object} The cleaned data.
 */
function formatInsiderTransactions(data) {
    if (!data || !data.transactions) return data;

    const cleanedTransactions = data.transactions.map(trans => ({
        Insider: trans.Insider,
        Position: trans.Position,
        Shares: trans.Shares,
        Transaction: trans.Transaction || 'Unknown',
        StartDate: trans['Start Date'],
        Value: trans.Value !== null && !isNaN(trans.Value) ? trans.Value : 0.0,
        Ownership: trans.Ownership
    }));

    return {
        ...data,
        transactions: cleanedTransactions
    };
}

module.exports = {
    formatInsiderTransactions,
};