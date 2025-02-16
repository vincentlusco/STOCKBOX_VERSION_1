import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TerminalContainer, 
  TerminalWindow, 
  TerminalContent,
  TerminalInputContainer 
} from '../components/TerminalLayout';

const TerminalInput = styled.div`
  display: flex;
  align-items: center;
  
  &:before {
    content: '>';
    margin-right: 10px;
  }
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: #00FF00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 16px;
  width: 100%;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
  }
`;

const Terminal = () => {
  const [commands, setCommands] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const contentRef = useRef(null);

  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [commands]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      setCommands([...commands, { input: currentCommand, output: 'Processing command...' }]);
      setCurrentCommand('');
    }
  };

  return (
    <TerminalContainer>
      <TerminalWindow>
        <TerminalContent ref={contentRef} className="terminal-text">
          {commands.map((cmd, index) => (
            <div key={index}>
              <div>{`> ${cmd.input}`}</div>
              <div>{cmd.output}</div>
            </div>
          ))}
        </TerminalContent>
        <TerminalInputContainer>
          <TerminalInput>
            <Input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyPress={handleCommand}
              autoFocus
              className="terminal-text"
              placeholder="ENTER COMMAND..."
            />
          </TerminalInput>
        </TerminalInputContainer>
      </TerminalWindow>
    </TerminalContainer>
  );
};

export default Terminal; 