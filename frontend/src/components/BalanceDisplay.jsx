import React from 'react';

export default function BalanceDisplay({ balances }) {
  return (
    <div className="space-y-2">
      <div>ETH: {balances.eth} ETH</div>
      <div>Token In: {balances.tokenIn} </div>
      <div>Token Out: {balances.tokenOut} </div>
    </div>
  );
}
