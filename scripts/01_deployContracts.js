const {
    Contract, ContractFactory, utils, constants,
} = require("ethers")

const WETH9 = require("../WETH9.json")

const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json')


async function main() {
    const [owner, trader] = await ethers.getSigners()


    const Usdt = await ethers.getContractFactory('Tether', owner);
    const usdt = await Usdt.deploy();
    const Usdc = await ethers.getContractFactory('UsdCoin', owner);
    const usdc = await Usdc.deploy();
    const Weth = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
    const weth = await Weth.deploy();


    const mintAmount = utils.parseEther('100000')
    await usdt.connect(owner).mint(owner.address, mintAmount)
    await usdc.connect(owner).mint(owner.address, mintAmount)
    await usdt.connect(owner).mint(trader.address, mintAmount)
    await usdc.connect(owner).mint(trader.address, mintAmount)


    const FactoryA = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
    const factoryA = await FactoryA.deploy(owner.address)
    // const FactoryB = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
    // const factoryB = await FactoryB.deploy(owner.address)


    const txA1 = await factoryA.createPair(usdt.address, usdc.address);
    await txA1.wait()
    // const txB1 = await factoryB.createPair(usdt.address, usdc.address);
    // await txB1.wait()


    const pairAddressA = await factoryA.getPair(usdt.address, usdc.address)
    // const pairAddressB = await factoryB.getPair(usdt.address, usdc.address)


    const pairA = new Contract(pairAddressA, pairArtifact.abi, owner)
    // const pairB = new Contract(pairAddressB, pairArtifact.abi, owner)


    const RouterA = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner);
    const routerA = await RouterA.deploy(factoryA.address, weth.address)
    // const RouterB = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner);
    // const routerB = await RouterB.deploy(factoryB.address, weth.address)


    const approvalUsdtOwnerA = await usdt.connect(owner).approve(routerA.address, constants.MaxUint256);
    await approvalUsdtOwnerA.wait();
    const approvalUsdcOwnerA = await usdc.connect(owner).approve(routerA.address, constants.MaxUint256);
    await approvalUsdcOwnerA.wait();
    const approvalUsdtTraderA = await usdt.connect(trader).approve(routerA.address, constants.MaxUint256);
    await approvalUsdtTraderA.wait();
    const approvalUsdcTraderA = await usdc.connect(trader).approve(routerA.address, constants.MaxUint256);
    await approvalUsdcTraderA.wait();
    // const approvalUsdtOwnerB = await usdt.connect(owner).approve(routerB.address, constants.MaxUint256);
    // await approvalUsdtOwnerB.wait();
    // const approvalUsdcOwnerB = await usdc.connect(owner).approve(routerB.address, constants.MaxUint256);
    // await approvalUsdcOwnerB.wait();
    // const approvalUsdtTraderB = await usdt.connect(trader).approve(routerB.address, constants.MaxUint256);
    // await approvalUsdtTraderB.wait();
    // const approvalUsdcTraderB = await usdc.connect(trader).approve(routerB.address, constants.MaxUint256);
    // await approvalUsdcTraderB.wait();


    const addLiquidityTxA = await routerA.connect(owner).addLiquidity(
        usdt.address,
        usdc.address,
        utils.parseEther('100'),
        utils.parseEther('100'),
        0,
        0,
        owner.address,
        Math.floor(Date.now() / 1000 + (10 * 60)),
        { gasLimit: utils.hexlify(1_000_000)}
    );
    addLiquidityTxA.wait();


    // const addLiquidityTxB = await routerB.connect(owner).addLiquidity(
    //     usdt.address,
    //     usdc.address,
    //     utils.parseEther('50'),
    //     utils.parseEther('150'),
    //     0,
    //     0,
    //     owner.address,
    //     Math.floor(Date.now() / 1000 + (10 * 60)),
    //     { gasLimit: utils.hexlify(1_000_000)}
    // );
    // addLiquidityTxB.wait();


    let reservesA
    // let reservesB
    reservesA = await pairA.getReserves()
    console.log('reservesA', reservesA)
    // reservesB = await pairB.getReserves()
    // console.log('reservesB', reservesB)


    console.log('USDT_ADDRESS=', `'${usdt.address}'`)
    console.log('USDC_ADDRESS=', `'${usdc.address}'`)
    console.log('WETH_ADDRESS=', `'${weth.address}'`)
    console.log('FACTORY_A_ADDRESS=', `'${factoryA.address}'`)
    // console.log('FACTORY_B_ADDRESS=', `'${factoryB.address}'`)
    console.log('PAIR_A_ADDRESS=', `'${pairAddressA}'`)
    // console.log('PAIR_B_ADDRESS=', `'${pairAddressB}'`)
    console.log('ROUTER_A_ADDRESS=', `'${routerA.address}'`)
    // console.log('ROUTER_B_ADDRESS=', `'${routerB.address}'`)
}

/*
npx hardhat run --network localhost scripts/01_deployContracts.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });