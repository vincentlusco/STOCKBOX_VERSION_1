import styled from 'styled-components';

export const TerminalContainer = styled.div`
  position: fixed;
  top: 80px; // Adjust based on your header height
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: var(--terminal-black);
`;

export const TerminalWindow = styled.div`
  border: 1px solid #00FF00;
  box-shadow: 0 0 10px #00FF00;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--terminal-black);
`;

export const TerminalContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 60px; // Space for input
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000000;
  }

  &::-webkit-scrollbar-thumb {
    background: #00FF00;
    border: 1px solid #00FF00;
  }
`;

export const TerminalInputContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: var(--terminal-black);
  border-top: 1px solid #00FF00;
`; 