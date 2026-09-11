# Setup & Local Development Guide

This guide provides instructions to run the **EduSoulbound** platform locally or deploy to the Ethereum Sepolia testnet.

---

## 1. Prerequisites

- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or `v10.x`
- **MetaMask** browser extension installed in Chrome, Brave, or Firefox.

---

## 2. Installation

1. Navigate to the project root:
   ```bash
   cd educational-credentials
   ```

2. Install root dependencies (Hardhat, OpenZeppelin, Ethers.js):
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## 3. Environment Configuration

Copy the sample environment file:
```bash
cp .env.example .env
```

### Local Development (Default):
No paid services or external keys are required. The system automatically runs with Hardhat's in-memory blockchain and built-in simulated IPFS gateway fallback.

### Sepolia Testnet (Optional):
If deploying to Sepolia, populate `.env` with:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
```

---

## 4. Running the Local Blockchain & Contract

### Step 1: Start Hardhat Node
In your first terminal window, start the local node:
```bash
npx hardhat node
```
*This starts a local EVM node at `http://127.0.0.1:8545` with 20 funded test accounts (each having 10,000 ETH).*

### Step 2: Deploy Contract
In a second terminal window, deploy the smart contract to the local node:
```bash
npm run deploy:local
```
*This compiles the contracts, deploys `EducationalCredential.sol`, and automatically exports the ABI and contract address to `frontend/src/contracts/`.*

### Step 3: Seed Demo Credentials
Seed sample degrees for testing and viva presentation:
```bash
npm run seed:local
```

---

## 5. Launching the Frontend

In the second terminal window, navigate to `frontend` and start the Vite dev server:
```bash
cd frontend
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 6. Configuring MetaMask for Localhost

1. Open MetaMask -> Network Selector -> **Add Network Manually**.
2. Configure:
   - **Network Name**: Hardhat Localhost
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Import Hardhat Test Accounts using their private keys:
   - **Account #0 (Registrar / Issuer)**:
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Account #1 (Student Graduate)**:
     `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Account #2 (Third-Party / Employer)**:
     `0x5de4111afa1a4b93908f29f56b09f120fc04843c5247685ff8439ac610156206`
