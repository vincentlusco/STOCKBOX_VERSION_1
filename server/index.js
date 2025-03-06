const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const financeRoutes = require('./routes/finance');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/finance', financeRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 4611;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 