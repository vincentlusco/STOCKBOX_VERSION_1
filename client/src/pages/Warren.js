import React from 'react';
import { TerminalContainer, TerminalWindow, TerminalContent } from '../components/TerminalLayout';

const Warren = () => {
  return (
    <TerminalContainer>
      <TerminalWindow>
        <TerminalContent className="terminal-text">
          <h2>WARREN BUFFETT ANALYSIS</h2>
          <div>
            <p>CURRENT HOLDINGS:</p>
            <p>MARKET ANALYSIS:</p>
            <p>VALUE METRICS:</p>
          </div>
        </TerminalContent>
      </TerminalWindow>
    </TerminalContainer>
  );
};

export default Warren; 