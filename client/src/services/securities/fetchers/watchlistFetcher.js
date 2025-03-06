import axios from 'axios';

export const fetchWatchlistData = async (symbols) => {
    const url = 'http://localhost:4611/api/yahoo/watchlist';
    console.log(`Fetching watchlist data for symbols: ${symbols} at URL: ${url}`);
    try {
        const response = await axios.post(url, { symbols });
        console.log(`Received response for watchlist data:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${symbols}:`, error);
        return [];
    }
};