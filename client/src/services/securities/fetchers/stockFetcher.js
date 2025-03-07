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
    const response = await axios.get(`/api/yahoo/${symbol}/tech`);
    return response.data;
};

export const fetchStockNews = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/news`);
    return response.data;
};

export const fetchStockDividends = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/dividends`);
    return response.data;
};

export const fetchStockEarnings = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/earnings`);
    return response.data;
};

export const fetchCompanyInfo = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/info`);
    return response.data;
};

export const fetchInsiderTransactions = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/insider`);
    return response.data;
};

export const fetchPeerComparison = async (symbol) => {
    const response = await axios.get(`/api/yahoo/${symbol}/peers`);
    return response.data;
};