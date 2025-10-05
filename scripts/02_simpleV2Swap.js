const { ethers } = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function swapTokens({ tokenInAddr, tokenOutAddr, amountInStr, privateKey, rpcUrl, routerAddress }) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tokenIn = new ethers.Contract(tokenInAddr, ERC20_ABI, wallet);

  // Parse token amount based on decimals
  const decimals = await tokenIn.decimals();
  const amountIn = ethers.utils.parseUnits(amountInStr, decimals);

  const router = new ethers.Contract(routerAddress, routerArtifact.abi, wallet);

  // Check current allowance
  const currentAllowance = await tokenIn.allowance(wallet.address, routerAddress);

  if (currentAllowance.lt(amountIn)) {
    console.log(`Approving router to spend tokens...`);
    const approveTx = await tokenIn.approve(routerAddress, ethers.constants.MaxUint256);
    await approveTx.wait();
    console.log('Approval confirmed.');
  } else {
    console.log('Sufficient allowance detected, no approval needed.');
  }

  // Calculate amountOutMin with 1% slippage tolerance
  const amountsOut = await router.getAmountsOut(amountIn, [tokenInAddr, tokenOutAddr]);
  const amountOutMin = amountsOut[1].mul(99).div(100);

  const swapTx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenInAddr, tokenOutAddr],
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
    { gasLimit: 1_000_000 }
  );

  const receipt = await swapTx.wait();
  console.log(`Swap successful, transaction hash: ${receipt.transactionHash}`);

  return receipt.transactionHash;
}

module.exports = { swapTokens };
