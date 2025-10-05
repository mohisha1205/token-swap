import React, { useEffect, useState } from 'react';

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      // Listen for account change
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        if (onConnect) onConnect(accounts[0]);
      });
      // Listen for network change (optionally reload or update state)
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload(); // Or trigger a state update
      });
    }
    // Cleanup listener on unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    }
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Install MetaMask!');
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    if (onConnect) onConnect(accounts[0]);
  };

  return (
    <div>
      {!account ? (
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-green-100 px-4 py-2 rounded mb-4">
          Connected: <span className="font-mono">{account}</span>
        </div>
      )}
    </div>
  );
}
