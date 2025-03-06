import React, { useState, useRef, useEffect } from 'react';
import { STOCK_COMMANDS } from '../../services/securities/commands/stockCommands';
import styled from 'styled-components';

const TerminalContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: var(--terminal-black);
`;

const TerminalWindow = styled.div`
  border: 1px solid #00FF00;
  box-shadow: 0 0 10px #00FF00;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--terminal-black);
`;

const TerminalContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 60px;
  text-transform: uppercase;
  
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

const TerminalInput = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: var(--terminal-black);
  border-top: 1px solid #00FF00;
  text-transform: uppercase;

  input {
    width: 100%;
    background: transparent;
    border: none;
    color: #00FF00;
    font-family: 'Share Tech Mono', monospace;
    font-size: 16px;
    outline: none;
    text-transform: uppercase;
  }
`;

const LoadingAnimation = styled.div`
  font-family: 'Share Tech Mono', monospace;
  color: #00FF00;
  animation: blink 1s step-end infinite;

  @keyframes blink {_
}
`;

const Terminal = ({ handleCommand }) => {
    const [history, setHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const terminalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inputValue.trim()) return;

        setIsLoading(true);
        const response = await handleCommand(inputValue);
        setIsLoading(false);
        
        setHistory(prev => [...prev, 
            { type: 'input', content: `> ${inputValue}` },
            { type: 'output', content: response }
        ]);
        
        setInputValue('');
        
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    };

    return (
        <TerminalContainer>
            <TerminalWindow>
                <TerminalContent ref={terminalRef}>
                    {history.map((entry, index) => (
                        <div key={index} className={`terminal-${entry.type}`}>
                            {entry.type === 'output' ? (
                                <div className="terminal-output" dangerouslySetInnerHTML={{ __html: entry.content }} />
                            ) : (
                                entry.content
                            )}
                        </div>
                    ))}
                    {isLoading && <LoadingAnimation>loading...</LoadingAnimation>}
                </TerminalContent>
                <TerminalInput>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                    </form>
                </TerminalInput>
            </TerminalWindow>
        </TerminalContainer>
    );
};

export default Terminal;