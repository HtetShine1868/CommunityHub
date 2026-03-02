import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TestPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Display the API URL being used
    setApiUrl(import.meta.env.VITE_API_URL || 'Not set');
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Try to fetch topics as a simple test
      const response = await api.get('/topics');
      setTestResult(`✅ Success! Received ${response.data.length} topics`);
    } catch (error: any) {
      setTestResult(`❌ Failed: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔧 Connection Test Page</h1>
      
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <p><strong>VITE_API_URL from env:</strong> {import.meta.env.VITE_API_URL || '❌ Not set'}</p>
        <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
        <p><strong>API_URL being used:</strong> {apiUrl}</p>
      </div>

      <button 
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {testResult && (
        <div style={{ 
          padding: '15px', 
          background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '5px'
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default TestPage;