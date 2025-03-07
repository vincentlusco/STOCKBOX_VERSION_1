import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';
import './Chart.css'; // Import the CSS file for styling

const ChartContainer = styled.div`
    width: 100%;
    height: 90vh;
    padding: 20px;
    background-color: ${(props) => props.theme.background};
    border: 1px solid ${(props) => props.theme.borderColor};
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 255, 0, 0.1);
    color: ${(props) => props.theme.textColor};
    display: flex;
    flex-direction: column;
    font-family: 'Share Tech Mono', monospace;
    text-transform: uppercase;
`;

const Chart = () => {
    const { theme, timezone } = useContext(ThemeContext);
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
                    "timezone": timezone,
                    "theme": theme.background === '#000000' ? 'dark' : 'light',
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": theme.background,
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
    }, [numCharts, theme, timezone]);

    return (
        <ChartContainer theme={theme}>
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
        </ChartContainer>
    );
};

export default Chart;