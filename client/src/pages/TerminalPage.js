import React from 'react';
import Terminal from '../components/Terminal/Terminal';

const TerminalPage = ({ handleCommand }) => {
  return (
    <div className="terminal-page">
      <Terminal handleCommand={handleCommand} />
    </div>
  );
};

export default TerminalPage;