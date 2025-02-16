import React from 'react';
import styled from 'styled-components';
import { TerminalContainer, TerminalWindow, TerminalContent } from '../components/TerminalLayout';

const WatchlistTable = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const WatchlistItem = styled.div`
  border: 1px solid #00FF00;
  padding: 10px;
`;

const Watchlist = () => {
  return (
    <TerminalContainer>
      <TerminalWindow>
        <TerminalContent className="terminal-text">
          <h2>WATCHLIST</h2>
          <WatchlistTable>
            {/* Placeholder for watchlist items */}
            <WatchlistItem>AAPL: $150.00</WatchlistItem>
            <WatchlistItem>GOOGL: $2800.00</WatchlistItem>
            <WatchlistItem>TSLA: $900.00</WatchlistItem>
          </WatchlistTable>
        </TerminalContent>
      </TerminalWindow>
    </TerminalContainer>
  );
};

export default Watchlist; 