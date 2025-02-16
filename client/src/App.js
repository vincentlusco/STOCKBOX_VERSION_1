import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Terminal from './pages/Terminal';
import Watchlist from './pages/Watchlist';
import Warren from './pages/Warren';
import Help from './pages/Help';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Terminal />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/warren" element={<Warren />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
