import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokenSelector from './TokenSelector';


const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function SwapForm() {
  const [provider] = useState(() => new ethers.providers.JsonRpcProvider(import.meta.env.VITE_REACT_APP_ALCHEMY_API_URL));

  const [tokenList, setTokenList] = useState([]);
  const [tokenIn, setTokenIn] = useState(null);
  const [tokenOut, setTokenOut] = useState(null);
  const [amount, setAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [message, setMessage] = useState('');

  const [ethBalance, setEthBalance] = useState(null);
  const [tokenInBalance, setTokenInBalance] = useState(null);
  const [tokenOutBalance, setTokenOutBalance] = useState(null);

  useEffect(() => {
    async function fetchTokenList() {
      try {
        const res = await fetch('/tokenlist');
        const data = await res.json();
        setTokenList(data.tokens || []);
      } catch {
        setTokenList([]);
      }
    }
    fetchTokenList();
  }, []);

  useEffect(() => {
    async function fetchBalances() {
      if (!userAddress || !ethers.utils.isAddress(userAddress)) {
        setEthBalance(null);
        setTokenInBalance(null);
        setTokenOutBalance(null);
        return;
      }
      try {
        const ethBal = await provider.getBalance(userAddress);
        setEthBalance(ethers.utils.formatEther(ethBal));

        if (tokenIn && tokenIn.address) {
          const tokenInContract = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
          const bal = await tokenInContract.balanceOf(userAddress);
          const decimals = tokenIn.decimals !== undefined ? tokenIn.decimals : await tokenInContract.decimals();
          setTokenInBalance(ethers.utils.formatUnits(bal, decimals));
        } else {
          setTokenInBalance(null);
        }

        if (tokenOut && tokenOut.address) {
          const tokenOutContract = new ethers.Contract(tokenOut.address, ERC20_ABI, provider);
          const bal = await tokenOutContract.balanceOf(userAddress);
          const decimals = tokenOut.decimals !== undefined ? tokenOut.decimals : await tokenOutContract.decimals();
          setTokenOutBalance(ethers.utils.formatUnits(bal, decimals));
        } else {
          setTokenOutBalance(null);
        }
      } catch {
        setEthBalance(null);
        setTokenInBalance(null);
        setTokenOutBalance(null);
      }
    }
    fetchBalances();
  }, [userAddress, tokenIn, tokenOut, provider]);

  async function onSwap() {
    setMessage('');
    if (!tokenIn || !tokenOut || !amount || !userAddress) {
      setMessage('Fill all fields correctly.');
      return;
    }
    try {
      const res = await fetch('/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn: amount,
          userAddress,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // setMessage(`Swap submitted. TxHash: ${data.txHash}`);
        setMessage(`Swap submitted.`);


        await new Promise(res => setTimeout(res, 3000));
        if (userAddress && ethers.utils.isAddress(userAddress)) {
          const ethBal = await provider.getBalance(userAddress);
          setEthBalance(ethers.utils.formatEther(ethBal));
          if (tokenIn && tokenIn.address) {
            const tokenInContract = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
            const bal = await tokenInContract.balanceOf(userAddress);
            const decimals = tokenIn.decimals !== undefined ? tokenIn.decimals : await tokenInContract.decimals();
            setTokenInBalance(ethers.utils.formatUnits(bal, decimals));
          }
          if (tokenOut && tokenOut.address) {
            const tokenOutContract = new ethers.Contract(tokenOut.address, ERC20_ABI, provider);
            const bal = await tokenOutContract.balanceOf(userAddress);
            const decimals = tokenOut.decimals !== undefined ? tokenOut.decimals : await tokenOutContract.decimals();
            setTokenOutBalance(ethers.utils.formatUnits(bal, decimals));
          }
        }
      } else {
        const error = await res.text();
        setMessage(`Swap failed: ${error}`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
  }

  return (
    <div style={{ padding: '1em', fontFamily: 'Arial, sans-serif' }}>
      <h2>Token Swap</h2>
      <div>
        <label>Your Ethereum Address:</label><br />
        <input
          type="text"
          placeholder="0x..."
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          style={{ width: '400px', padding: '0.3em', marginBottom: '1em' }}
        />
          <div>
          <label>ETH Balance:</label><br />
          <div>{ethBalance !== null ? ethBalance : '-'}</div>
        </div>
      </div>
      <TokenSelector label="Token In:" provider={provider} tokenList={tokenList} onSelect={setTokenIn} />
      {tokenInBalance !== null && (
        <div>Balance of {tokenIn?.symbol || 'Token In'}: {tokenInBalance}</div>
      )}
      <TokenSelector label="Token Out:" provider={provider} tokenList={tokenList} onSelect={setTokenOut} />
      {tokenOutBalance !== null && (
        <div>Balance of {tokenOut?.symbol || 'Token Out'}: {tokenOutBalance}</div>
      )}
      <div>
        <label>Amount to Swap:</label><br />
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '400px', padding: '0.3em', marginBottom: '1em' }}
        />
      </div>
      <button onClick={onSwap} style={{ padding: '0.5em 1.5em', fontSize: '1em' }}>Swap</button>
      {message && <div style={{ marginTop: '1em', whiteSpace: 'pre-line' }}>{message}</div>}
    </div>
  );
}
