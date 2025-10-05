const { ethers, providers, Contract, utils, constants } = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    const owner = provider.getSigner(0);
    const trader = provider.getSigner(1);
    const traderAddress = await trader.getAddress();

    const USDT_ADDRESS = process.argv[2];
    const USDC_ADDRESS = process.argv[3];
    const ROUTER_ADDRESS = process.argv[4];
    const amountInStr = process.argv[5];  // e.g. "1.0"

    if (!USDT_ADDRESS || !USDC_ADDRESS || !ROUTER_ADDRESS || !amountInStr) {
        console.log("Usage: node 02_simpleV2Swap.js <tokenInAddress> <tokenOutAddress> <routerAddress> <amountIn>");
        process.exit(1);
    }

    const router = new Contract(ROUTER_ADDRESS, routerArtifact.abi, provider);

    const tokenIn = new Contract(USDT_ADDRESS, [
        "function balanceOf(address) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
    ], provider);

    const tokenOut = new Contract(USDC_ADDRESS, [
        "function balanceOf(address) view returns (uint256)"
    ], provider);

    const routerWithSigner = router.connect(trader);
    const tokenInWithSigner = tokenIn.connect(trader);

    const logBalances = async () => {
        const ethBalance = await provider.getBalance(traderAddress);
        const tokenInBalance = await tokenIn.balanceOf(traderAddress);
        const tokenOutBalance = await tokenOut.balanceOf(traderAddress);
        console.log(`Trader balances: ETH=${ethers.utils.formatEther(ethBalance)}, TokenIn=${ethers.utils.formatEther(tokenInBalance)}, TokenOut=${ethers.utils.formatEther(tokenOutBalance)}`);
    };

    await logBalances();

    const amountIn = utils.parseEther(amountInStr);

    // Estimate output amount using getAmountsOut
    let amountsOut = [];
    try {
        amountsOut = await router.getAmountsOut(amountIn, [USDT_ADDRESS, USDC_ADDRESS]);
    } catch (err) {
        console.error("Error fetching amounts out:", err);
        process.exit(1);
    }
    const estimatedAmountOut = amountsOut[1];
    console.log(`Estimated output amount: ${utils.formatEther(estimatedAmountOut)} tokens`);

    // Set slippage tolerance and calculate minimum amount out
    const slippageTolerance = 0.01; // 1%
    const amountOutMin = estimatedAmountOut.sub(estimatedAmountOut.mul(slippageTolerance * 100).div(10000));
    console.log(`Setting minimum output to: ${utils.formatEther(amountOutMin)} tokens to protect against slippage`);

    // Approve router to spend tokenIn
    const approveTx = await tokenInWithSigner.approve(ROUTER_ADDRESS, constants.MaxUint256);
    await approveTx.wait();

    // Execute swap with amountOutMin for slippage protection
    const swapTx = await routerWithSigner.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        traderAddress,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { gasLimit: 1_000_000 }
    );
    await swapTx.wait();

    console.log(`Swapped ${amountInStr} tokens from ${USDT_ADDRESS} to ${USDC_ADDRESS}`);

    await logBalances();

    console.log(`\n\nTrader Address: ${traderAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
