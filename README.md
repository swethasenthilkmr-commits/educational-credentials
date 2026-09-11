# Cryptographically Anchored Educational Credentials: A Decentralized Framework for SDG 4 Quality Education

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![ERC-5192](https://img.shields.io/badge/Standard-ERC--5192%20Soulbound-blue)](https://eips.ethereum.org/EIPS/eip-5192)
[![Hardhat](https://img.shields.io/badge/Tooling-Hardhat-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![UN SDG 4](https://img.shields.io/badge/UN%20SDG%204-Quality%20Education-c5192d)](https://sdgs.un.org/goals/goal4)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Undergraduate 2nd-Year Engineering Capstone Project**  
> A decentralized, privacy-preserving, soulbound educational credential platform designed to eliminate academic diploma forgery, empower lifelong student ownership, and provide instant, zero-cost third-party verification.

---

## 1. Project Overview

Academic credential fraud represents a multi-billion dollar vulnerability worldwide. Counterfeit paper degrees, fabricated PDF transcripts, and fraudulent digital badges undermine institutional trust and overburden employers with costly, prolonged manual verification processes. Furthermore, students displaced by geopolitical crises or institutional disruptions frequently lose access to their academic histories.

**EduSoulbound** solves these problems by combining:
1. **ERC-5192 Soulbound Tokens (SBTs)**: Non-transferable digital credentials permanently anchored to a graduate's Web3 wallet address.
2. **Deterministic Cryptographic Hashing**: Keccak-256 fingerprinting that mathematically certifies document integrity.
3. **Decentralized Storage (IPFS)**: Off-chain canonical JSON metadata storage, adhering strictly to privacy-by-design principles (no student PII on-chain).
4. **Institutional Revocation & Auditability**: Enables universities to revoke credentials (for academic misconduct or clerical errors) while maintaining an immutable historical ledger.
5. **Instant 6-Point Verification Engine**: A publicly accessible, zero-login scorecard that verifies on-chain existence, wallet ownership, soulbound status, revocation state, IPFS metadata, and cryptographic hash matches.

---

## 2. Problem Statement Addressed

| # | Traditional Academic Credential Vulnerability | EduSoulbound Decentralized Solution |
| :---: | :--- | :--- |
| **1** | **Forged Paper Diplomas** | Immutable on-chain fingerprinting with Keccak-256 prevents counterfeit creation. |
| **2** | **Tampered Digital PDFs** | Recomputed hashes immediately flag any modification of grades or majors. |
| **3** | **Centralized Single Points of Failure** | Distributed EVM blockchain ensures high availability without server downtime. |
| **4** | **Slow Employer Verification (weeks)** | Instant verification (< 2 seconds) via public portal or QR code scan. |
| **5** | **Commercial NFT Transferability** | ERC-5192 Soulbound protocol cryptographically blocks token transfers (`ErrSoulboundTokenLocked`). |
| **6** | **Institutional Disruption / War / Closure** | Credentials persist permanently in student wallets regardless of institutional status. |
| **7** | **Student Privacy Violations** | No student PII (name, GPA, address) is stored on the public blockchain. |

---

## 3. UN SDG 4 Alignment: Quality Education

This project directly operationalizes the United Nations Sustainable Development Goal 4:
- **Target 4.3**: *"Ensure equal access for all women and men to affordable and quality technical, vocational and tertiary education, including university."*  
  *Impact*: Removes expensive third-party apostille and transcript notarization fees, democratizing cross-border academic mobility.
- **Target 4.4**: *"Substantially increase the number of youth and adults who have relevant skills for employment and entrepreneurship."*  
  *Impact*: Accelerates recruitment and workforce entry by providing employers with instant, zero-friction verification of certified skills.

---

## 4. System Architecture

```text
                    ┌─────────────────────────────────────────┐
                    │       UNIVERSITY REGISTRAR PORTAL       │
                    │   - Connects Authorized Issuer Wallet   │
                    │   - Inputs Student & Degree Details     │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │      CANONICALIZATION & HASHING         │
                    │   - Deterministic field ordering        │
                    │   - H_doc = Keccak-256(canonicalStr)    │
                    └────────────┬──────────────────┬─────────┘
                                 │                  │
               Metadata JSON     │                  │ Credential Hash
                                 ▼                  ▼
                    ┌─────────────────┐   ┌───────────────────────┐
                    │   IPFS STORAGE  │   │  SMART CONTRACT (EVM) │
                    │ (Pinata / Mock) │   │ EducationalCredential │
                    │ Returns: CID    │   │ - safeMintSBT()       │
                    └────────────┬────┘   │ - locked(id) == true  │
                                 │        │ - revokeCredential()  │
                                 │ URI    │ - Keccak-256 Anchor   │
                                 └───────►│ - AccessControl       │
                                          └───────────┬───────────┘
                                                      │ Mint SBT
                                                      ▼
                    ┌─────────────────────────────────────────┐
                    │             STUDENT WALLET              │
                    │   - Owns Soulbound Token (Non-transfer) │
                    │   - Generates Verification QR Code      │
                    │   - Views Credential Certificate Card   │
                    └────────────────────┬────────────────────┘
                                         │
                               QR / Token ID / Student Address
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │             VERIFIER PORTAL             │
                    │   1. Reads on-chain contract state:     │
                    │      - Token exists & owner matches     │
                    │      - locked(tokenId) is true          │
                    │      - isRevoked(tokenId) is false      │
                    │   2. Fetches IPFS metadata JSON         │
                    │   3. Recomputes Keccak-256 hash         │
                    │   4. Compares with on-chain hash        │
                    └────────────────────┬────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               ✓ CREDENTIAL VERIFIED             ⚠ CREDENTIAL REVOKED
              (or ✗ HASH MISMATCH)
```

---

## 5. Technology Stack

- **Smart Contracts**: Solidity `^0.8.24` (Cancun EVM), OpenZeppelin Contracts v5, ERC-5192 Minimal Soulbound standard.
- **Development Environment**: Hardhat, Ethers.js v6, Chai & Mocha.
- **Frontend Framework**: React 18, Vite 5, Tailwind CSS, Lucide React, Canvas Confetti.
- **Web3 Integration**: Ethers.js v6, MetaMask Browser Extension.
- **Storage & Hashing**: IPFS (Pinata API / simulated local gateway fallback), Keccak-256.
- **Target Networks**: Hardhat Localhost (`31337`), Ethereum Sepolia Testnet (`11155111`).

---

## 6. Project Structure

```text
educational-credentials/
├── contracts/
│   ├── EducationalCredential.sol         # Main ERC-5192 Soulbound contract
│   └── interfaces/
│       └── IERC5192.sol                  # Minimal Soulbound Token interface
├── scripts/
│   ├── deploy.js                         # Deployment & ABI export script
│   └── seed.js                           # Demo credentials seeding script
├── test/
│   ├── EducationalCredential.test.js     # 14 unit & integration tests
│   └── EndToEndWorkflow.test.js          # Complete 15-step demonstration test
├── ipfs/
│   └── upload.js                         # IPFS upload & canonical hashing utility
├── docs/
│   ├── architecture.md                   # Detailed architecture & data flow
│   ├── setup.md                          # Comprehensive setup instructions
│   ├── smart-contract.md                 # Smart contract specification
│   ├── demo.md                           # Step-by-step viva presentation script
│   └── viva-guide.md                     # Engineering viva Q&A defense guide
├── frontend/
│   ├── src/
│   │   ├── components/                   # Navbar, Footer, Badges, QR, Cards
│   │   ├── pages/                        # Home, Issuer, Issue, Student, Verify, About
│   │   ├── context/                      # Web3Context (MetaMask & contracts)
│   │   ├── services/                     # Canonical hash & IPFS clients
│   │   ├── fixtures/                     # Demo credential fixtures
│   │   └── contracts/                    # Auto-exported contract address & ABI
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── hardhat.config.js
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 7. Quickstart Guide (Local Development)

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9.x` or `v10.x`
- MetaMask browser extension

### Step 1: Install Dependencies
```bash
# In repository root
npm install

# In frontend directory
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```
*(No paid external keys required for local testing; simulated IPFS fallback activates automatically).*

### Step 3: Run Tests
```bash
npx hardhat test
```
*Executes all 15 automated test cases verifying deployment, soulbound enforcement, revocation, and hashing.*

### Step 4: Start Local Hardhat Blockchain
Open **Terminal 1**:
```bash
npx hardhat node
```
*Spawns a local EVM node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Step 5: Deploy & Seed Contract
Open **Terminal 2**:
```bash
# Deploy EducationalCredential contract
npm run deploy:local

# Seed demo credentials for instant testing
npm run seed:local
```

### Step 6: Start React Frontend
In **Terminal 2**:
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:3000` in your web browser.

---

## 8. MetaMask Configuration (Localhost)

1. Open MetaMask -> **Add Network Manually**.
   - **Network Name**: Hardhat Localhost
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
2. Import Hardhat Test Accounts:
   - **Registrar Account (Account #0)**:
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Student Account (Account #1)**:
     `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

---

## 9. Sepolia Testnet Deployment

To deploy to Ethereum Sepolia testnet:
1. In `.env`, provide:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
   ```
2. Deploy to Sepolia:
   ```bash
   npm run deploy:sepolia
   ```
3. Update `frontend/src/contracts/contractAddress.json` and switch MetaMask to Sepolia.

---

## 10. Security Considerations

- **No Student PII On-Chain**: Respects privacy regulations (GDPR/FERPA). Personal names and grades live solely in off-chain IPFS metadata.
- **Role-Based Access Control**: Issuance and revocation are restricted to accredited university wallets using OpenZeppelin's audited `AccessControl`.
- **Custom Errors**: Gas-efficient custom errors (`ErrSoulboundTokenLocked`, `ErrTokenAlreadyRevoked`) provide descriptive, viva-friendly feedback.
- **No Secret Exposure**: All frontend environment variables are sanitized; private keys are never exposed in client bundles.

---

## 11. Limitations & Future Scope

### Limitations
- Dependent on availability of public/pinned IPFS gateways.
- Prototype uses wallet address as proxy for student identity (requires integration with institutional SSO in production).

### Future Scope
1. **Zero-Knowledge Proofs (zk-SNARKs)**: Prove qualifications (e.g. `GPA >= 3.5` or degree earned) without revealing student transcripts.
2. **W3C Decentralized Identifiers (DIDs) & Verifiable Credentials (VCs)**: Standardize cross-platform credential portability.
3. **Multi-University Federation**: Enable collegiate consortiums where university boards vote to grant registrar roles to member universities.

---

## 12. Academic Citation & Team

**Project Title**: Cryptographically Anchored Educational Credentials: A Decentralized Framework for SDG 4 Quality Education  
**Degree**: Bachelor of Technology / Engineering (2nd Year Project)  
**Academic Alignment**: United Nations Sustainable Development Goal 4 (Quality Education)  
**License**: MIT Open Source License
