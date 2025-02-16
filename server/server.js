const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const net = require('net');
const connectDB = require('./db/connection');

// Load environment variables
dotenv.config();

// Function to find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      // If port is in use, try the next port
      resolve(findAvailablePort(startPort + 1));
    });

    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server with dynamic port
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Find available port (starting from 4000)
    const port = await findAvailablePort(4000);
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      // Store the port in a file that the client can read
      require('fs').writeFileSync(
        './.env',
        `PORT=${port}\n`,
        { flag: 'w' }
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 