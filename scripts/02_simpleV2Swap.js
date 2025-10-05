const { ethers, Contract, utils, constants } = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

async function swapTokens({ tokenInAddr, tokenOutAddr, amountInStr, privateKey, rpcUrl, routerAddress }) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const router = new Contract(routerAddress, routerArtifact.abi, wallet);
  const tokenIn = new Contract(tokenInAddr, [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ], wallet);

  // Get decimals dynamically and parse amountIn accordingly
  const decimals = await tokenIn.decimals();
  const amountIn = ethers.utils.parseUnits(amountInStr, decimals);

  // Check allowance and approve if needed
  const allowance = await tokenIn.allowance(wallet.address, router.address);
  if (allowance.lt(amountIn)) {
    const approveTx = await tokenIn.approve(router.address, constants.MaxUint256);
    await approveTx.wait();
  }

  // Calculate amountOutMin with 1% slippage tolerance
  const amountsOut = await router.getAmountsOut(amountIn, [tokenInAddr, tokenOutAddr]);
  const amountOutMin = amountsOut[1].mul(99).div(100);

  // Execute swap
  const swapTx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenInAddr, tokenOutAddr],
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
    { gasLimit: 1_000_000 }
  );
  const receipt = await swapTx.wait();

  return receipt.transactionHash;
}

module.exports = { swapTokens };
