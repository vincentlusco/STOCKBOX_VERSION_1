const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/connection');
const yahooRoutes = require('./routes/yahooRoutes');
const newsRoutes = require('./routes/newsRoutes');
const cacheService = require('./services/cacheService');
const stockService = require('./services/stockService');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Initialize services
cacheService.init();
stockService.init();

// Add this before the routes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/yahoo', yahooRoutes);
app.use('/api/news', newsRoutes);

// Watchlist endpoint
app.use('/watchlist', yahooRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Use port 4611
const PORT = process.env.PORT || 4611;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, async () => {
            console.log(`Server running on port ${PORT}`);

            // Start Ngrok tunnel for the backend server
            const backendUrl = await ngrok.connect(PORT);
            console.log(`Ngrok tunnel for backend URL: ${backendUrl}`);

            // Start Ngrok tunnel for the client server
            const clientUrl = await ngrok.connect(3000);
            console.log(`Ngrok tunnel for client URL: ${clientUrl}`);

            console.log(`Ngrok web interface: http://127.0.0.1:4040`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();