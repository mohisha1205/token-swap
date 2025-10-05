# Token Swap Platform on Ethereum (Sepolia)

## Overview

This project implements a backend token swap platform enabling users to swap ERC-20 tokens seamlessly on the Ethereum Sepolia testnet using the Uniswap V2 decentralized exchange protocol. The platform ensures secure allowance handling and transaction tracking.

### Key Features
- Token swap functionality on Ethereum (Sepolia)
- ERC-20 token allowance checks and approvals
- Minimum output amount calculation with slippage tolerance
- Transaction hash retrieval and confirmation tracking

---

## Architecture & Components

- **Backend:** Node.js with Express.js API handling swap requests
- **Smart Contracts:** Interacts with Uniswap V2 Router deployed on Sepolia
- **Blockchain Interaction:** ethers.js for contract calls and signing
- **Token Management:** Supports multiple ERC-20 tokens with dynamic allowance/approval

---

## Token List Extensibility

Currently, the platform is configured with a limited set of three tokens: USDC, USDT and DAI for demonstration purposes on Sepolia. However, the token list is modular and easily extendable. Additional tokens can be supported by simply adding their details (address, symbol, name, decimals) to the sepolia token list JSON. This allows seamless scaling to include more tokens without changing the core backend logic.

---

## Setup & Deployment

### Prerequisites
- Node.js v14+ installed
- Access to Sepolia testnet RPC URL (e.g., Alchemy, Infura)
- Wallet private key with Sepolia ETH and token balances

### Environment Variables
Create a `.env` file in the backend root with these variables: 
```env
RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ROUTER_ADDRESS='0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3'
PORT=3000
```

### Running the Backend

Run your backend server using:

```node index.js```

This will start the backend API on `http://localhost:3000` (or the port you set in `.env`).

### Using the Frontend

Once the backend is running, use the frontend application to perform token swaps by sending requests to your backend API. The frontend communicates with the backend to trigger swaps on the Ethereum Sepolia network.

### Video Demo Link
https://drive.google.com/file/d/1IqJr1kt07lSV9NCv7BdWxZC0bzxzyaxp/view?usp=sharing