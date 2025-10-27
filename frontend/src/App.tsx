// frontend/src/App.tsx
import { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // The URL of our healthCheck function.
    // In a real app, this would come from an environment variable.
    const healthCheckUrl = 'https://asia-southeast1-apex-ba819.cloudfunctions.net/healthCheck';

    fetch(healthCheckUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'ok') {
          setBackendStatus('ok');
        } else {
          throw new Error('Backend response was not ok.');
        }
      })
      .catch(error => {
        setBackendStatus('error');
        setErrorMessage(error.message);
        console.error('Error fetching backend status:', error);
      });
  }, []);

  const getStatusIndicator = () => {
    switch (backendStatus) {
      case 'loading':
        return <span className="text-yellow-500 animate-pulse">Checking...</span>;
      case 'ok':
        return <span className="text-green-500">Online</span>;
      case 'error':
        return <span className="text-red-500">Error</span>;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl mx-auto p-8 rounded-lg bg-gray-800 shadow-lg border border-gray-700">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">WellNexus Commerce OS</h1>
          <p className="text-gray-400 mt-2">Real-time System Status</p>
        </header>

        <div className="space-y-6">
          {/* System Status Section */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Core Services</h2>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">Backend API (healthCheck):</span>
              <div className="flex items-center space-x-2 font-mono">
                {getStatusIndicator()}
                <div className={`w-3 h-3 rounded-full ${backendStatus === 'ok' ? 'bg-green-500' : backendStatus === 'loading' ? 'bg-yellow-500 animate-ping' : 'bg-red-500'}`}></div>
              </div>
            </div>
            {backendStatus === 'error' && (
              <p className="text-red-400 text-sm mt-2 font-mono">Details: {errorMessage}</p>
            )}
          </div>

          {/* Onboarding Roadmap Section */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Next Steps: Onboarding Journey (v1)</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-cyan-500 text-gray-900 text-xs flex items-center justify-center mr-3 font-bold">1</span> Day 1: Account Activation & KYC</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-600 text-gray-400 text-xs flex items-center justify-center mr-3 font-bold">2</span> Day 3: SKU & Pricing Quiz</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-600 text-gray-400 text-xs flex items-center justify-center mr-3 font-bold">3</span> Day 7: Generate Referral Code</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-600 text-gray-400 text-xs flex items-center justify-center mr-3 font-bold">4</span> Day 14: First Sale Training</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
