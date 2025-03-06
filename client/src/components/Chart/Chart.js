import React, { useState, useEffect } from 'react';
import './Chart.css'; // Import the CSS file for styling

const Chart = () => {
    const [numCharts, setNumCharts] = useState(1);

    useEffect(() => {
        const loadTradingViewWidget = (containerId, symbol) => {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => {
                new window.TradingView.widget({
                    "width": "100%",
                    "height": "100%",
                    "symbol": symbol,
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "allow_symbol_change": true,
                    "container_id": containerId
                });
            };
            document.getElementById(containerId).appendChild(script);
        };

        const symbols = ["NASDAQ:AAPL", "NASDAQ:GOOGL", "NASDAQ:AMZN", "NASDAQ:MSFT"];
        for (let i = 0; i < numCharts; i++) {
            loadTradingViewWidget(`tradingview_widget_${i}`, symbols[i % symbols.length]);
        }
    }, [numCharts]);

    return (
        <div className="chart-container">
            <h1>Chart</h1>
            <div className="chart-buttons">
                <button onClick={() => setNumCharts(1)}>1 Chart</button>
                <button onClick={() => setNumCharts(2)}>2 Charts</button>
                <button onClick={() => setNumCharts(4)}>4 Charts</button>
            </div>
            <div className={`charts-layout charts-${numCharts}`}>
                {[...Array(numCharts)].map((_, index) => (
                    <div key={index} id={`tradingview_widget_${index}`} className="chart-widget"></div>
                ))}
            </div>
        </div>
    );
};

export default Chart;