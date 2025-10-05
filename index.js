const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { ethers } = require('ethers');
const { swapTokens } = require('./scripts/02_simpleV2Swap');

const app = express();
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// ERC-20 validation
async function isERC20(address) {
  try {
    const token = new ethers.Contract(address, ["function totalSupply() view returns (uint256)"], provider);
    await token.totalSupply();
    return true;
  } catch {
    return false;
  }
}

app.post('/swap', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, userAddress } = req.body;
    if (!tokenIn || !tokenOut || !amountIn || !userAddress) {
      return res.status(400).send('Missing parameters: tokenIn, tokenOut, amountIn, userAddress');
    }

    if (!(await isERC20(tokenIn))) {
      return res.status(400).send(`tokenIn address ${tokenIn} is not a valid ERC-20 token`);
    }
    if (!(await isERC20(tokenOut))) {
      return res.status(400).send(`tokenOut address ${tokenOut} is not a valid ERC-20 token`);
    }

    const txHash = await swapTokens({
      tokenInAddr: tokenIn,
      tokenOutAddr: tokenOut,
      amountInStr: amountIn,
      privateKey: process.env.PRIVATE_KEY,
      rpcUrl: process.env.RPC_URL,
      routerAddress: process.env.ROUTER_ADDRESS,
    });

    res.json({ txHash });
  } catch (error) {
    console.error('Swap failed:', error);
    res.status(500).send('Swap failed');
  }
});

app.get('/tokenlist', (req, res) => {
  const filePath = path.resolve(__dirname, 'sepolia-tokenlist.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).send('Failed to read token list');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Swap backend listening on port ${PORT}`);
});
