#!/bin/bash

# Installation script for StockBox
echo "🚀 Setting up StockBox..."

# Check if .env exists, if not create it
if [ ! -f "./server/.env" ]; then
    echo "📝 Creating environment file..."
    cp ./server/.env.example ./server/.env
    echo "⚠️ Please edit ./server/.env with your API keys"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Create startup service
echo "🔧 Creating startup service..."
sudo tee /etc/systemd/system/stockbox.service << EOF
[Unit]
Description=StockBox Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl enable stockbox
sudo systemctl start stockbox

echo "✅ StockBox installation complete!"
echo "💻 Access the application at http://localhost:3000"
echo "⚙️ Please configure your API keys in ./server/.env" 