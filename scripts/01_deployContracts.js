const {
    Contract, ContractFactory, utils, constants,
} = require("ethers");

const WETH9 = require("../WETH9.json");

const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json');

async function main() {
    const [owner, trader] = await ethers.getSigners();

    // Token configurations (Add or remove tokens here)
    const tokenConfigs = [
        { name: "USDT", symbol: "USDT" },
        { name: "USDC", symbol: "USDC" },
        { name: "DAI", symbol: "DAI" }
    ];

    // Deploy the MockERC20 token contract for each configured token
    const tokenInstances = [];
    for (const conf of tokenConfigs) {
        const TokenFactory = await ethers.getContractFactory("MockERC20", owner);
        const token = await TokenFactory.deploy(conf.name, conf.symbol);
        await token.deployed();
        // Mint tokens to owner and trader
        await token.mint(owner.address, utils.parseEther("100000"));
        await token.mint(trader.address, utils.parseEther("100000"));
        tokenInstances.push(token);
        console.log(`Deployed ${conf.symbol} at`, token.address);
    }

    // Deploy WETH
    const Weth = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
    const weth = await Weth.deploy();
    await weth.deployed();
    console.log("Deployed WETH at", weth.address);

    // Deploy Uniswap Factory
    const Factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
    const factory = await Factory.deploy(owner.address);
    await factory.deployed();
    console.log("Deployed Factory at", factory.address);

    // Deploy Router with the factory and WETH address
    const Router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner);
    const router = await Router.deploy(factory.address, weth.address);
    await router.deployed();
    console.log("Deployed Router at", router.address);

    // Create pairs for all unique token combinations and add liquidity
    for (let i = 0; i < tokenInstances.length; i++) {
        for (let j = i + 1; j < tokenInstances.length; j++) {
            const tokenA = tokenInstances[i];
            const tokenB = tokenInstances[j];

            // Create pair
            let tx = await factory.createPair(tokenA.address, tokenB.address);
            await tx.wait();
            let pairAddress = await factory.getPair(tokenA.address, tokenB.address);
            console.log(`Created pair ${tokenConfigs[i].symbol}-${tokenConfigs[j].symbol}:`, pairAddress);

            // Approve tokens for router by owner
            await (await tokenA.connect(owner).approve(router.address, constants.MaxUint256)).wait();
            await (await tokenB.connect(owner).approve(router.address, constants.MaxUint256)).wait();

            // Add liquidity (equal amounts for simplicity)
            const amountA = utils.parseEther('100');
            const amountB = utils.parseEther('100');

            tx = await router.connect(owner).addLiquidity(
                tokenA.address,
                tokenB.address,
                amountA,
                amountB,
                0,
                0,
                owner.address,
                Math.floor(Date.now() / 1000 + 600),
                { gasLimit: utils.hexlify(1_000_000) }
            );
            await tx.wait();
            console.log(`Added liquidity for pair ${tokenConfigs[i].symbol}-${tokenConfigs[j].symbol}`);
        }
    }

    // Print addresses for reference
    for (let i = 0; i < tokenInstances.length; i++) {
        console.log(`${tokenConfigs[i].symbol}_ADDRESS=`, `'${tokenInstances[i].address}'`);
    }
    console.log('WETH_ADDRESS=', `'${weth.address}'`);
    console.log('FACTORY_ADDRESS=', `'${factory.address}'`);
    console.log('ROUTER_ADDRESS=', `'${router.address}'`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
