import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)"
];

export default function TokenSelector({ provider, tokenList, onSelect, label }) {
  const [input, setInput] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [error, setError] = useState('');

  // Deduplicate tokens by address (case-insensitive)
  const uniqueTokens = tokenList.filter((token, index, self) =>
    index === self.findIndex(t => t.address.toLowerCase() === token.address.toLowerCase())
  );

  useEffect(() => {
    async function fetchOnChainMeta(address) {
      try {
        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        const [symbol, name, decimals] = await Promise.all([
          contract.symbol(),
          contract.name(),
          contract.decimals()
        ]);
        return { address, symbol, name, decimals };
      } catch {
        return null;
      }
    }

    async function handleInput() {
      if (input.length === 42 && ethers.utils.isAddress(input)) {
        const tokenFromList = uniqueTokens.find(t => t.address.toLowerCase() === input.toLowerCase());
        if (tokenFromList) {
          setSelectedToken(tokenFromList);
          setError('');
          onSelect(tokenFromList);
        } else {
          const onChainMeta = await fetchOnChainMeta(input);
          if (onChainMeta) {
            setSelectedToken(onChainMeta);
            setError('');
            onSelect(onChainMeta);
          } else {
            setSelectedToken(null);
            setError('Invalid token address or no metadata found');
            onSelect(null);
          }
        }
      } else if (input === '') {
        setSelectedToken(null);
        setError('');
        onSelect(null);
      } else {
        // While user is typing incomplete address, don't clear previous token or set error
        setError('');
      }
    }

    const timeoutId = setTimeout(handleInput, 500);
    return () => clearTimeout(timeoutId);
  }, [input, uniqueTokens, onSelect, provider]);

  function handleSelectFromList(token) {
    setInput(token.address);
    setSelectedToken(token);
    onSelect(token);
    setError('');
  }

  return (
    <div style={{ marginBottom: '1em' }}>
      <label>{label}</label><br />
      <input
        type="text"
        placeholder="Enter token address"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '400px', padding: '0.3em', marginBottom: '0.5em' }}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {selectedToken && (
        <div>
          <strong>{selectedToken.symbol}</strong> - {selectedToken.name} (Decimals: {selectedToken.decimals})
        </div>
      )}
      <details style={{ marginTop: '0.5em' }}>
        <summary>Select a popular token:</summary>
        <ul style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {uniqueTokens.map(token => (
            <li key={token.address}>
              <button
                type="button"
                onClick={() => handleSelectFromList(token)}
                style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
              >
                {token.symbol} - {token.name}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
