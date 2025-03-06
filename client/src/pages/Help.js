import React from 'react';
import styled from 'styled-components';

const HelpContainer = styled.div`
    padding: 20px;
    color: #00FF00;
    background-color: #000000;
    font-family: 'Share Tech Mono', monospace;
`;

const Help = () => {
    return (
        <HelpContainer>
            <h1>Help</h1>
            <p>Welcome to Stockbox! This application allows you to manage and track your stock investments. Below are the available commands and their descriptions:</p>
            <h2>Available Commands</h2>
            <ul>
                <li><strong>HELP</strong> - Display this help message</li>
                <li><strong>ADD &lt;SYMBOL&gt;</strong> - Add a stock to the watchlist (e.g., ADD TSLA)</li>
                <li><strong>UNADD &lt;SYMBOL&gt;</strong> - Remove a stock from the watchlist (e.g., UNADD TSLA)</li>
                <li><strong>PRICE &lt;SYMBOL&gt;</strong> - Get the current price of a stock (e.g., PRICE AAPL)</li>
                <li><strong>NEWS &lt;SYMBOL&gt;</strong> - Get the latest news for a stock (e.g., NEWS AAPL)</li>
                <li><strong>EARN &lt;SYMBOL&gt;</strong> - Get the earnings data for a stock (e.g., EARN AAPL)</li>
                <li><strong>DIV &lt;SYMBOL&gt;</strong> - Get the dividends data for a stock (e.g., DIV AAPL)</li>
                <li><strong>FUND &lt;SYMBOL&gt;</strong> - Get the fundamentals of a stock (e.g., FUND AAPL)</li>
                <li><strong>TECH &lt;SYMBOL&gt;</strong> - Get the technical analysis of a stock (e.g., TECH AAPL)</li>
            </ul>
            <h2>Pages</h2>
            <ul>
                <li><strong>Terminal</strong> - Use the terminal to enter commands and interact with the app.</li>
                <li><strong>Watchlist</strong> - View and manage your watchlist of stocks.</li>
                <li><strong>Chart</strong> - View charts and graphical data for stocks.</li>
                <li><strong>Warren</strong> - Get AI insights and recommendations based on investment principles.</li>
            </ul>
        </HelpContainer>
    );
};

export default Help;