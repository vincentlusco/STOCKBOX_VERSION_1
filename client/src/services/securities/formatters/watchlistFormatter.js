export const formatWatchlistData = (stock) => {
    return {
        symbol: stock.symbol,
        currentPrice: stock.currentPrice.toFixed(2),
        openPrice: stock.openPrice.toFixed(2),
        dailyChange: stock.dailyChange.toFixed(2),
        percentChange: stock.percentChange.toFixed(2),
        dailyHigh: stock.dailyHigh.toFixed(2),
        dailyLow: stock.dailyLow.toFixed(2),
    };
};