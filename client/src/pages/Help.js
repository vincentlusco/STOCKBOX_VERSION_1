import React, { useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../context/ThemeContext';

const HelpContainer = styled.div`
    padding: 20px;
    color: ${(props) => props.theme.textColor};
    background-color: ${(props) => props.theme.background};
    border: 1px solid ${(props) => props.theme.borderColor};
    min-height: 100vh;
    font-family: 'Share Tech Mono', monospace;
`;

const Help = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <HelpContainer theme={theme}>
            <h1>Help</h1>
            <p>Welcome to Stockbox! This application allows you to manage and track your stock investments. Below are the available commands and their descriptions:</p>
            <h2>Available Commands</h2>
            <pre>
                {`
HELP - DISPLAY THIS HELP MESSAGE
ADD - ADD A STOCK TO THE WATCHLIST (E.G., ADD TSLA)
UNADD - REMOVE A STOCK FROM THE WATCHLIST (E.G., UNADD TSLA)
PRICE - GET THE CURRENT PRICE OF A STOCK (E.G., PRICE AAPL)
NEWS - GET THE LATEST NEWS FOR A STOCK (E.G., NEWS AAPL)
EARN - GET THE EARNINGS DATA FOR A STOCK (E.G., EARN AAPL)
DIV - GET THE DIVIDENDS DATA FOR A STOCK (E.G., DIV AAPL)
FUND - GET THE FUNDAMENTALS OF A STOCK (E.G., FUND AAPL)
TECH - GET THE TECHNICAL ANALYSIS OF A STOCK (E.G., TECH AAPL)
INFO - GET THE COMPANY INFORMATION (E.G., INFO AAPL)
INSIDER - GET THE INSIDER TRANSACTIONS (E.G., INSIDER AAPL)
                `}
            </pre>
            <h2>Pages</h2>
            <ul>
                <li><strong>Terminal</strong> - Use the terminal to enter commands and interact with the app.</li>
                <li><strong>Watchlist</strong> - View and manage your watchlist of stocks.</li>
                <li><strong>Chart</strong> - View charts and graphical data for stocks.</li>
                <li><strong>Settings</strong> - Customize the appearance and settings of the app.</li>
                <li><strong>Help</strong> - View help and documentation.</li>
            </ul>
        </HelpContainer>
    );
};

export default Help;