import React, { useState, useRef, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';
import './Terminal.css';

const TerminalContainer = styled.div`
    height: 100vh;
    width: 100%;
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.textColor};
    font-family: 'Share Tech Mono', monospace;
    padding: 20px;
    display: flex;
    flex-direction: column;
`;

const TerminalWindow = styled.div`
    border: 1px solid ${(props) => props.theme.borderColor};
    box-shadow: 0 0 10px ${(props) => props.theme.borderColor};
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: ${(props) => props.theme.background};
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
        background: ${(props) => props.theme.background};
    }

    &::-webkit-scrollbar-thumb {
        background: ${(props) => props.theme.borderColor};
        border: 1px solid ${(props) => props.theme.borderColor};
    }
`;

const TerminalInput = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background-color: ${(props) => props.theme.background};
    border-top: 1px solid ${(props) => props.theme.borderColor};
    text-transform: uppercase;

    input {
        width: 100%;
        background: transparent;
        border: none;
        color: ${(props) => props.theme.textColor};
        font-family: 'Share Tech Mono', monospace;
        font-size: 16px;
        outline: none;
        text-transform: uppercase;
    }
`;

const LoadingAnimation = styled.div`
    font-family: 'Share Tech Mono', monospace;
    color: ${(props) => props.theme.textColor};
    animation: blink 1s step-end infinite;

    @keyframes blink {
        50% { opacity: 0; }
    }
`;

const Terminal = ({ handleCommand }) => {
    const [history, setHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const terminalRef = useRef(null);
    const { theme } = useContext(ThemeContext);

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
        <TerminalContainer theme={theme}>
            <TerminalWindow theme={theme}>
                <TerminalContent theme={theme} ref={terminalRef}>
                    {history.map((entry, index) => (
                        <div key={index} className={`terminal-${entry.type}`}>
                            {entry.type === 'output' ? (
                                <div className="terminal-output" dangerouslySetInnerHTML={{ __html: entry.content }} />
                            ) : (
                                entry.content
                            )}
                        </div>
                    ))}
                    {isLoading && <LoadingAnimation theme={theme}>loading...</LoadingAnimation>}
                </TerminalContent>
                <TerminalInput theme={theme}>
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