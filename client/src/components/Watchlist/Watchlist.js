import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';
import './Watchlist.css'; // Assuming you have a CSS file for the Watchlist component
import { fetchWatchlistData } from '../../services/securities/fetchers/watchlistFetcher';
import { formatWatchlistData } from '../../services/securities/formatters/watchlistFormatter';

const WatchlistContainer = styled.div`
    padding: 20px;
    color: ${(props) => props.theme.textColor};
    background-color: ${(props) => props.theme.background};
    border: 1px solid ${(props) => props.theme.borderColor};
    min-height: 90vh;
`;

const Watchlist = ({ watchlist }) => {
    const { theme } = useContext(ThemeContext);
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            console.log(`Current watchlist: ${watchlist}`);
            if (watchlist && watchlist.length > 0) {
                const data = await fetchWatchlistData(watchlist);
                if (data.length > 0) {
                    console.log(`Fetched data:`, data);
                    const formattedData = data.map(stock => formatWatchlistData(stock));
                    setStockData(formattedData);
                } else {
                    console.log(`No data fetched, setting stockData to empty array`);
                    setStockData([]); // Set an empty array if data is null
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Fetch data every 10 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [watchlist]);

    return (
        <WatchlistContainer theme={theme}>
            <h1>Watchlist</h1>
            <table className="watchlist-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Current Price</th>
                        <th>Open Price</th>
                        <th>Daily Change</th>
                        <th>Percent Change</th>
                        <th>Daily High</th>
                        <th>Daily Low</th>
                    </tr>
                </thead>
                <tbody>
                    {stockData.map((data, index) => (
                        <tr key={index}>
                            <td>{data.symbol}</td>
                            <td>${data.currentPrice}</td>
                            <td>${data.openPrice}</td>
                            <td className={data.dailyChange >= 0 ? 'positive' : 'negative'}>
                                {data.dailyChange >= 0 ? `+${data.dailyChange}` : data.dailyChange}
                            </td>
                            <td className={data.percentChange >= 0 ? 'positive' : 'negative'}>
                                {data.percentChange >= 0 ? `+${data.percentChange}%` : `${data.percentChange}%`}
                            </td>
                            <td>${data.dailyHigh}</td>
                            <td>${data.dailyLow}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WatchlistContainer>
    );
};

export default Watchlist;