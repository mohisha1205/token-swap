// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import WalletConnect from './components/WalletConnect.jsx';
// import SwapForm from './components/SwapForm.jsx';
// import BalanceDisplay from './components/BalanceDisplay.jsx';
// import { tokens } from './constants/tokens';

// function App() {
//   const [account, setAccount] = useState(null);
//   const [ethBalance, setEthBalance] = useState('loading');
//   const [balances, setBalances] = useState({ eth: 'loading', tokenIn: 'loading', tokenOut: 'loading' });

//   const handleConnect = (acc) => setAccount(acc);

// //   useEffect(() => {
// //   const fetchEthBalance = async () => {
// //     if (!account) {
// //       setEthBalance('loading');
// //       return;
// //     }
// //     try {
// //       console.log(`account`,account);
// //       // Always use MetaMask's provider
// //       const provider = new ethers.providers.Web3Provider(window.ethereum);
// //       const balance = await provider.getBalance(account);
// //       setEthBalance(ethers.utils.formatEther(balance));
// //     } catch (error) {
// //       setEthBalance('error');
// //       console.error('Error fetching ETH balance', error);
// //     }
// //   };
// //   fetchEthBalance();
// // }, [account]);

// useEffect(() => {
//   if (!account) {
//     setEthBalance('loading');
//     return;
//   }
//   const fetchBalanceRaw = async () => {
//     try {
//       const balanceHex = await window.ethereum.request({
//         method: 'eth_getBalance',
//         params: [account, 'latest'],
//       });
//       const balance = ethers.utils.formatEther(balanceHex);
//       setEthBalance(balance);
//       console.log('Balance fetched via ethereum.request:', balance);
//       console.log('Provider network:', await provider.getNetwork());
//       console.log('Using account:', account);

//     } catch (err) {
//       setEthBalance('error');
//       console.error('Failed to fetch balance:', err);
//     }
//   };
//   fetchBalanceRaw();
// }, [account]);


//   const handleSwap = ({ tokenIn, tokenOut, amount }) => {
//     alert(`Would swap ${amount} of ${tokenIn} for ${tokenOut}`);
//     // To integrate blockchain logic here.
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 font-sans flex flex-col items-center justify-start">
//       <h1 className="text-3xl font-bold mb-4 text-center text-indigo-700">Token Swap UI</h1>
      
//       {/* Prominent Connect Wallet button */}
//       <div className="mb-8">
//         <WalletConnect onConnect={handleConnect} />
//       </div>

//       {account && (
//         <>
//           {/* <div className="mt-4 mb-4 w-full max-w-md">
//             <BalanceDisplay balances={balances} />
//           </div> */}
//           <div>
//             ETH: {ethBalance !== 'loading' ? `${ethBalance} ETH` : 'loading'}
//           </div>
//           <div className="w-full max-w-md">
//             <SwapForm tokens={tokens} account={account} onSwap={handleSwap} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

import React from 'react';
import SwapForm from './components/SwapForm';

function App() {
  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2em' }}>
      <h1>Token Swap</h1>
      <SwapForm />
    </div>
  );
}

export default App;
