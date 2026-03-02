import React, { useEffect } from 'react';

const DebugEnv: React.FC = () => {
  useEffect(() => {
    console.log('🔍 Environment Variables Debug:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('All env vars:', import.meta.env);
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '10px' }}>
      <h3>Environment Debug</h3>
      <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || '❌ NOT SET'}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
      <p><strong>Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default DebugEnv;