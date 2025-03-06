export class WebSocketService {
    constructor() {
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
        this.connect();
    }

    connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;

        try {
            this.ws = new WebSocket('ws://localhost:3000/ws');
            
            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                logger.info('WebSocket connected');
            };

            this.ws.onclose = () => {
                this.isConnecting = false;
                this.handleDisconnect();
            };

            this.ws.onerror = (error) => {
                logger.error('WebSocket error:', error);
                this.isConnecting = false;
                this.handleDisconnect();
            };
        } catch (error) {
            logger.error('WebSocket connection failed:', error);
            this.isConnecting = false;
            this.handleDisconnect();
        }
    }

    handleDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        } else {
            logger.error('Max reconnection attempts reached');
        }
    }
} 