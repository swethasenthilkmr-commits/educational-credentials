# Live Demonstration Script (Viva Ready)

This document provides an exact step-by-step walkthrough to demonstrate the complete credential lifecycle during an undergraduate engineering project evaluation or viva voce.

---

## Demonstration Overview

| Stage | Actor | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Registrar | Connects Account #0 & fills degree form | Metadata & Keccak-256 hash generated |
| **Phase 2** | Smart Contract | Mints ERC-5192 SBT | Token #1 anchored, `locked(1) == true` |
| **Phase 3** | Student | Connects Account #1 & views diploma card | Shows "VALID", "SOULBOUND", and QR Code |
| **Phase 4** | Student | Clicks "Test Non-Transferability" | Transaction reverts with `ErrSoulboundTokenLocked` |
| **Phase 5** | Verifier | Scans QR or enters Token ID #1 | 6-Point scorecard confirms ✓ VALID |
| **Phase 6** | Registrar | Revokes Token #1 with reason | Blockchain records revocation state |
| **Phase 7** | Verifier | Refreshes or re-enters Token ID #1 | Scorecard immediately alerts ⚠ REVOKED |

---

## Detailed Step-by-Step Viva Execution

### Step 1: Registrar Issuance
1. Open `http://localhost:3000/issuer`.
2. Connect MetaMask using **Account #0** (`0xf39Fd6e5...`). Notice the **Registrar** badge in the navbar.
3. Click **Issue New Credential** (`/issuer/issue`).
4. Click **Demo Graduate 1** to autofill sample student data:
   - Student ID: `STU-2024-104`
   - Student Wallet: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Account #1)
   - Degree: `Bachelor of Technology in Computer Science and Engineering`
5. Click **Generate Hash & Mint SBT**.
6. Observe progress pipeline:
   - Constructing canonical serialization
   - Computing Keccak-256 cryptographic fingerprint
   - Uploading metadata to IPFS
   - Confirming MetaMask mint transaction
7. Once confirmed, confetti triggers and the success card displays the **Token ID**, **Keccak-256 Hash**, **IPFS URI**, and **Transaction Hash**.

### Step 2: Student Holder Experience & Transfer Revert
1. Switch MetaMask account to **Account #1** (`0x7099797...`).
2. Navigate to **Student Portal** (`/student`).
3. Observe the digital diploma card rendered with:
   - Conferred Degree and Institution
   - `✓ VALID` badge
   - `🔒 ERC-5192 SOULBOUND` badge
4. Click **Show QR** to view the dynamic verification QR code.
5. Click **Test Non-Transferability** to simulate transferring the degree to Account #2.
6. **Viva Highlight**: Observe that the contract cleanly reverts with `ErrSoulboundTokenLocked`. Explain to examiners that degrees are non-transferable assets tied directly to the recipient.

### Step 3: Public Verification Scorecard
1. Open an incognito browser window or navigate to `/verify`.
2. In the Token ID field, enter `1`.
3. Click **Audit & Verify Credential**.
4. The system executes an independent 6-point audit:
   - ✓ Token Exists On-Chain
   - ✓ Student Wallet Ownership Verified
   - ✓ ERC-5192 Soulbound (Locked) Status Verified
   - ✓ Revocation State Check (Not Revoked)
   - ✓ IPFS Metadata Retrieval
   - ✓ Cryptographic Keccak-256 Hash Matching
5. Highlight the cryptographic hash comparison showing identical on-chain and off-chain 32-byte hashes.

### Step 4: Revocation & Real-Time Audit Trail
1. Switch back to **Account #0** and go to `/issuer`.
2. Find Token ID #1 in the Institutional Credential Registry table and click **Revoke**.
3. Input reason: `"Academic integrity violation: Plagiarized senior capstone thesis"`.
4. Confirm the transaction in MetaMask.
5. Return to the `/verify` page and audit Token ID #1 again.
6. **Viva Highlight**: The scorecard displays a large red **⚠ CREDENTIAL REVOKED** banner, displaying the exact timestamp and institutional reason, while the historical record remains permanently readable on the blockchain!
