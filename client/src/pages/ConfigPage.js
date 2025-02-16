import React, { useState, useEffect } from 'react';

const ConfigPage = () => {
  const [config, setConfig] = useState({});
  const [status, setStatus] = useState({});

  // Check API key status
  useEffect(() => {
    const checkKeys = async () => {
      const response = await fetch('/api/config/status');
      const data = await response.json();
      setStatus(data);
    };
    checkKeys();
  }, []);

  return (
    <div>
      <h1>StockBox Configuration</h1>
      {Object.entries(status).map(([api, status]) => (
        <div key={api}>
          <h3>{api}</h3>
          <span>Status: {status ? '✅' : '❌'}</span>
        </div>
      ))}
    </div>
  );
};

export default ConfigPage; 