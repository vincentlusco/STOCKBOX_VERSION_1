import axios from 'axios';
import { logger } from '../utils/logger';

const PROXY_URL = 'http://localhost:5000/api'; // Your backend proxy

export const proxyService = {
    async get(endpoint, params = {}) {
        try {
            const response = await axios.get(`${PROXY_URL}${endpoint}`, { params });
            return response.data;
        } catch (error) {
            logger.error('Proxy service error:', error);
            throw error;
        }
    }
}; 