import { formatCurrency, formatPercent, formatVolume, formatNumber, formatDate } from './formatters';

/**
 * Formats price data based on stock type
 */
export const formatPrice = (data) => {
    if (!data) return 'NO DATA AVAILABLE';

    return `
${data.symbol} PRICE DATA
========================
Symbol: ${data.symbol}
Price: ${data.price.toFixed(2)}
Change: ${data.change ? data.change.toFixed(2) : 'N/A'} (${data.changePercent ? data.changePercent.toFixed(2) : 'N/A'}%)
Open: ${data.open ? data.open.toFixed(2) : 'N/A'}
High: ${data.high ? data.high.toFixed(2) : 'N/A'}
Low: ${data.low ? data.low.toFixed(2) : 'N/A'}
Volume: ${data.volume ? formatVolume(data.volume) : 'N/A'}
52-Week High: ${data.fiftyTwoWeekHigh ? data.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}
52-Week Low: ${data.fiftyTwoWeekLow ? data.fiftyTwoWeekLow.toFixed(2) : 'N/A'}
`.trim().replace(/\n/g, '<br>');
};

/**
 * Formats fundamental data
 */
export const formatFundamentals = (data) => {
    if (!data) return 'NO DATA AVAILABLE';

    return `
${data.symbol} FUNDAMENTAL DATA
========================
Market Cap: ${data.data.marketCap ? formatNumber(data.data.marketCap) : 'N/A'}
P/E Ratio: ${data.data.peRatio ? data.data.peRatio.toFixed(2) : 'N/A'}
EPS: ${data.data.eps ? data.data.eps.toFixed(2) : 'N/A'}
Profit Margin: ${data.data.profitMargin ? formatPercent(data.data.profitMargin) : 'N/A'}
Analyst Recommendation: ${typeof data.data.recommendation === 'number' ? data.data.recommendation.toFixed(2) : 'N/A'}
Price Targets:
Current: ${data.data.currentPrice ? data.data.currentPrice.toFixed(2) : 'N/A'}
Low: ${data.data.targetLow ? data.data.targetLow.toFixed(2) : 'N/A'}
Mean: ${data.data.targetMean ? data.data.targetMean.toFixed(2) : 'N/A'}
High: ${data.data.targetHigh ? data.data.targetHigh.toFixed(2) : 'N/A'}
`.trim().replace(/\n/g, '<br>');
};

/**
 * Formats technical data
 */
export const formatTechnical = (data) => {
    if (!data || !data.symbol) {
        console.log('No technical data available');
        return 'NO TECHNICAL DATA AVAILABLE';
    }

    console.log('Formatting technical data:', data);

    const latestSMA = data.sma ? data.sma[data.sma.length - 1] : null;
    const smaSummary = data.sma ? data.sma.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestEMA = data.ema ? data.ema[data.ema.length - 1] : null;
    const emaSummary = data.ema ? data.ema.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestRSI = data.rsi ? data.rsi[data.rsi.length - 1] : null;
    const rsiSummary = data.rsi ? data.rsi.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestBollingerUpper = data.bollingerBands ? data.bollingerBands.upper[data.bollingerBands.upper.length - 1] : null;
    const latestBollingerLower = data.bollingerBands ? data.bollingerBands.lower[data.bollingerBands.lower.length - 1] : null;
    const bollingerBandsUpperSummary = data.bollingerBands ? data.bollingerBands.upper.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';
    const bollingerBandsLowerSummary = data.bollingerBands ? data.bollingerBands.lower.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestMACD = data.macd ? data.macd[data.macd.length - 1] : null;
    const macdSummary = data.macd ? data.macd.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestStochastic = data.stochastic ? data.stochastic[data.stochastic.length - 1] : null;
    const stochasticSummary = data.stochastic ? data.stochastic.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestATR = data.atr ? data.atr[data.atr.length - 1] : null;
    const atrSummary = data.atr ? data.atr.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestParabolicSAR = data.parabolicSAR ? data.parabolicSAR[data.parabolicSAR.length - 1] : null;
    const parabolicSARSummary = data.parabolicSAR ? data.parabolicSAR.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    const latestADX = data.adx ? data.adx[data.adx.length - 1] : null;
    const adxSummary = data.adx ? data.adx.filter(value => value !== null).slice(-5).map(value => value.toFixed(2)).join(', ') : 'N/A';

    return `
${data.symbol} TECHNICAL DATA
========================
Latest SMA: ${latestSMA ? latestSMA.toFixed(2) : 'N/A'}
Recent SMA: ${smaSummary}

Latest EMA: ${latestEMA ? latestEMA.toFixed(2) : 'N/A'}
Recent EMA: ${emaSummary}

Latest RSI: ${latestRSI ? latestRSI.toFixed(2) : 'N/A'}
Recent RSI: ${rsiSummary}

Latest Bollinger Bands: ${latestBollingerUpper ? latestBollingerUpper.toFixed(2) : 'N/A'} / ${latestBollingerLower ? latestBollingerLower.toFixed(2) : 'N/A'}
Recent Bollinger Bands Upper: ${bollingerBandsUpperSummary}
Recent Bollinger Bands Lower: ${bollingerBandsLowerSummary}

Latest MACD: ${latestMACD ? latestMACD.toFixed(2) : 'N/A'}
Recent MACD: ${macdSummary}

Latest Stochastic: ${latestStochastic ? latestStochastic.toFixed(2) : 'N/A'}
Recent Stochastic: ${stochasticSummary}

Latest ATR: ${latestATR ? latestATR.toFixed(2) : 'N/A'}
Recent ATR: ${atrSummary}

Latest Parabolic SAR: ${latestParabolicSAR ? latestParabolicSAR.toFixed(2) : 'N/A'}
Recent Parabolic SAR: ${parabolicSARSummary}

Latest ADX: ${latestADX ? latestADX.toFixed(2) : 'N/A'}
Recent ADX: ${adxSummary}
`.trim().replace(/\n/g, '<br>');
};

/**
 * Formats news data
 */
export const formatNews = (data) => {
    if (!data || !data.news) return 'NO NEWS AVAILABLE';

    return data.news.map((article, index) => `
${index + 1}. ${article.content.title || 'No title available'}
Source: ${article.content.provider.displayName || 'Unknown'}
Date: ${article.content.pubDate ? new Date(article.content.pubDate).toLocaleString() : 'Unknown'}
Link: <a href="${article.content.canonicalUrl.url}" target="_blank">${article.content.canonicalUrl.url}</a>
`).join('<br><br>');
};

/**
 * Formats dividends data
 */
export const formatDividends = (data) => {
    if (!data) return 'NO DATA AVAILABLE';

    const dividendHistory = data.dividends.slice(-10).map(div => `
        <tr>
            <td>${formatDate(div.date)}</td>
            <td>${formatCurrency(div.amount)}</td>
        </tr>
    `).join('');

    return `
${data.symbol} DIVIDEND DATA
========================
<table>
    <tr>
        <th>Date</th>
        <th>Amount</th>
    </tr>
    ${dividendHistory}
</table>
`.trim();
};

/**
 * Formats earnings data
 */
export const formatEarnings = (data) => {
    if (!data) return 'NO DATA AVAILABLE';

    const earningsHistory = data.earnings.map(earn => `
        <tr>
            <td>${formatDate(earn.date)}</td>
            <td>${earn.actualEPS !== null ? earn.actualEPS.toFixed(2) : 'N/A'}</td>
            <td>${earn.estimatedEPS !== null ? formatCurrency(earn.estimatedEPS) : 'N/A'}</td>
        </tr>
    `).join('');

    return `
${data.symbol} EARNINGS DATA
========================
<table>
    <tr>
        <th>Date</th>
        <th>Actual EPS</th>
        <th>Estimated EPS</th>
    </tr>
    ${earningsHistory}
</table>
`.trim();
};

/**
 * Formats company info
 */
export const formatInfo = (data) => {
    if (!data) return 'No company info available';
    
    return `
Company: ${data.name}
Sector: ${data.sector || 'N/A'}
Industry: ${data.industry || 'N/A'}
Employees: ${data.employees ? formatNumber(data.employees, 0) : 'N/A'}
`.trim();
};

/**
 * Formats insider transaction data
 */
export const formatInsider = (data) => {
    if (!data?.data) return 'No insider data available';
    
    const { transactions, holders } = data.data;
    
    const recentTransactions = transactions.slice(0, 5).map(trans => 
        `${trans.name} (${trans.title})
Date: ${formatDate(trans.date)}
${trans.type}: ${formatNumber(trans.shares)} shares
Value: ${formatCurrency(trans.value, true)}`
    ).join('\n\n');

    const topHolders = holders.slice(0, 3).map(holder =>
        `${holder.name} (${holder.title})
Position: ${formatNumber(holder.position)} shares`
    ).join('\n\n');

    return `Recent Insider Transactions:
${recentTransactions}

Top Insider Holders:
${topHolders}`;
};

/**
 * Formats peer comparison data
 */
export const formatPeerComparison = (data) => {
    if (!data?.data) return 'No peer comparison data available';
    
    return `PEER COMPARISON:
${data.data.companies.map(peer => `
${peer.symbol}
Market Cap: ${formatCurrency(peer.marketCap, true)}
P/E Ratio: ${formatNumber(peer.peRatio)}
Revenue Growth: ${formatPercent(peer.revenueGrowth)}
Profit Margin: ${formatPercent(peer.profitMargin)}`).join('\n')}`.trim();
};

export const formatHelpMessage = (message) => {
    return message.replace(/\n/g, '<br>');
};
