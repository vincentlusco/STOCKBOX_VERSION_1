import React from 'react';
import styled from 'styled-components';
import { TerminalContainer, TerminalWindow, TerminalContent } from '../components/TerminalLayout';

const CommandList = styled.div`
  margin-top: 20px;
`;

const Command = styled.div`
  margin: 10px 0;
  &:before {
    content: '>';
    margin-right: 10px;
  }
`;

const Help = () => {
  return (
    <TerminalContainer>
      <TerminalWindow>
        <TerminalContent className="terminal-text">
          <h2>AVAILABLE COMMANDS</h2>
          <CommandList>
            <Command>STOCK [SYMBOL] - GET STOCK INFO</Command>
            <Command>WATCH [SYMBOL] - ADD TO WATCHLIST</Command>
            <Command>ANALYZE [SYMBOL] - FULL ANALYSIS</Command>
            <Command>CLEAR - CLEAR TERMINAL</Command>
            <Command>HELP - SHOW THIS MENU</Command>
          </CommandList>
        </TerminalContent>
      </TerminalWindow>
    </TerminalContainer>
  );
};

export default Help; 