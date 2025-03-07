export const formatWatchlistData = (stock) => {
    return {
        symbol: stock.symbol,
        currentPrice: stock.currentPrice ? stock.currentPrice.toFixed(2) : 'N/A',
        openPrice: stock.openPrice ? stock.openPrice.toFixed(2) : 'N/A',
        dailyChange: stock.dailyChange ? stock.dailyChange.toFixed(2) : 'N/A',
        percentChange: stock.percentChange ? stock.percentChange.toFixed(2) : 'N/A',
        dailyHigh: stock.dailyHigh ? stock.dailyHigh.toFixed(2) : 'N/A',
        dailyLow: stock.dailyLow ? stock.dailyLow.toFixed(2) : 'N/A',
    };
};