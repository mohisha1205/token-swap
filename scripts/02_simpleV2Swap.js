const { providers, Contract, utils, constants } = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const usdtArtifact = require("../artifacts/contracts/Tether.sol/Tether.json")
const usdcArtifact = require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json")

// Copy Addresses
// USDT_ADDRESS= '0x5FbDB2315678afecb367f032d93F642f64180aa3'
// USDC_ADDRESS= '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
// WETH_ADDRESS= '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
// FACTORY_A_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
// // FACTORY_B_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
// PAIR_A_ADDRESS= '0xD1f1bbbF65CceB5cAf1691a76c17D4E75213B69c'
// // PAIR_B_ADDRESS= '0x41Cc89c770ddFcF9b54C6C04CaAfeA885Ce8c1b8'
// ROUTER_A_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
// // ROUTER_B_ADDRESS= '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'

USDT_ADDRESS= '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
USDC_ADDRESS= '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'       
WETH_ADDRESS= '0x59b670e9fA9D0A427751Af201D676719a970857b'       
FACTORY_A_ADDRESS= '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'  
PAIR_A_ADDRESS= '0x9FeC70f1063f68BC3d030592ae24a2A629889349'     
ROUTER_A_ADDRESS= '0xc5a5C42992dECbae36851359345FE25997F5C42d' 

const provider = new providers.JsonRpcProvider('http://127.0.0.1:8545/')

const router = new Contract(
    ROUTER_A_ADDRESS,
    routerArtifact.abi,
    provider
)

const usdt = new Contract(
    USDT_ADDRESS,
    usdtArtifact.abi,
    provider
)

const usdc = new Contract(
    USDC_ADDRESS,
    usdcArtifact.abi,
    provider
)

const logBalance = async (signerObj) => {
    let ethBalance
    let usdtBalance
    let usdcBalance
    let balances
    ethBalance = await signerObj.getBalance()
    usdtBalance = await usdt.balanceOf(signerObj.address)
    usdcBalance = await usdc.balanceOf(signerObj.address)
    balances = {
        ethBalance: ethBalance,
        usdtBalance: usdtBalance,
        usdcBalance: usdcBalance,
    }
    console.log('balances', balances)

}

const main = async () => {
    const [owner, trader] = await ethers.getSigners()

    await logBalance(trader)

    const tx = await router.connect(trader).swapExactTokensForTokens(
        utils.parseUnits('1', 18),
        0,
        [USDT_ADDRESS, USDC_ADDRESS],
        trader.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {
            gasLimit: 1000000,
        }
    )

    await tx.wait()
    await logBalance(trader)
}

/*
npx hardhat run --network localhost scripts/02_simpleV2Swap.js
*/

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });