import axios from 'axios';

export const fetchStockPrice = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/price`);
    return response.data;
};

export const fetchStockFundamentals = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/fundamentals`);
    return response.data;
};

export const fetchStockTechnical = async (symbol) => {
    console.log(`Fetching technical data for ${symbol}`);
    try {
        const response = await axios.get(`/api/yahoo/${symbol}/tech`);
        console.log(`Technical data response for ${symbol}:`, response.data);
        return response.data; // Ensure the correct data is returned
    } catch (error) {
        console.error(`Error fetching technical data for ${symbol}:`, error);
        throw error;
    }
};

export const fetchStockNews = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/news`);
    return response.data;
};

export const fetchStockDividends = async (symbol) => {
    console.log(`Fetching dividends data for ${symbol}`);
    try {
        const response = await axios.get(`/api/yahoo/${symbol}/dividends`);
        console.log(`Dividends data response for ${symbol}:`, response.data);
        return response.data; // Ensure the correct data is returned
    } catch (error) {
        console.error(`Error fetching dividends data for ${symbol}:`, error);
        throw error;
    }
};

export const fetchStockEarnings = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/earnings`);
    return response.data;
};