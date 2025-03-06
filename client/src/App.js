import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import TerminalPage from './pages/TerminalPage';
import WatchlistPage from './pages/WatchlistPage';
import ChartPage from './pages/ChartPage';
import Help from './pages/Help';
import './styles/global.css';
import { STOCK_COMMANDS } from './services/securities/commands/stockCommands';

const WATCHLIST_KEY = 'stockbox_watchlist';

function App() {
  const [watchlist, setWatchlist] = useState(['TSLA', 'FOX', 'NFLX', 'MSFT']); // Initial watchlist

  const handleCommand = async (command) => {
    const [cmd, symbol] = command.split(' ');

    if (STOCK_COMMANDS[cmd.toUpperCase()]) {
      const response = await STOCK_COMMANDS[cmd.toUpperCase()].handler(symbol);
      if (cmd.toUpperCase() === 'ADD') {
        setWatchlist((prevWatchlist) => [...prevWatchlist, symbol.toUpperCase()]);
      } else if (cmd.toUpperCase() === 'UNADD') {
        setWatchlist((prevWatchlist) => prevWatchlist.filter(item => item !== symbol.toUpperCase()));
      }
      console.log(response);
      return response;
    } else {
      return 'Unknown command. Type HELP for a list of available commands.';
    }
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<TerminalPage handleCommand={handleCommand} />} />
            <Route path="/terminal" element={<TerminalPage handleCommand={handleCommand} />} />
            <Route path="/watchlist" element={<WatchlistPage watchlist={watchlist} />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
