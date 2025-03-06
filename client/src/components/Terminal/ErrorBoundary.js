import React from 'react';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logger.error('Terminal Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: 'red' }}>
                    Error: {this.state.error.message}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 