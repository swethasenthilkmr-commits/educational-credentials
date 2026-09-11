# Comprehensive Viva Voce Guide & Examiner Questions

This document prepares undergraduate engineering students to confidently explain and defend the design, implementation, and security choices of the **EduSoulbound** platform.

---

## 1. Core Concepts & Theoretical Background

### Why Blockchain for Academic Credentials?
Traditional credentials rely on paper certificates (easily forged with modern desktop publishing) or centralized university databases (single points of failure, vulnerable to ransomware, and inaccessible if an institution ceases operations or is disrupted by conflict). 

Blockchain provides:
- **Immutability**: Once an authorized registrar records a credential hash, it cannot be tampered with or retroactively altered.
- **High Availability**: Decentralized node architecture ensures credentials can be independently validated 24/7/365 without relying on the university registrar's internal servers being online.
- **Cryptographic Verifiability**: Mathematical proofs (elliptic curve digital signatures and cryptographic hash functions) replace trust in physical paper stamps.

---

## 2. Smart Contract Architecture

### Why ERC-5192 instead of plain ERC-721?
Commercial NFTs (ERC-721) are designed to be freely traded on marketplaces like OpenSea. If a university degree were minted as a normal ERC-721 token, the graduate could sell or transfer their degree to an unqualified buyer. 

**ERC-5192** standardizes Minimal Soulbound Tokens. In `EducationalCredential.sol`:
- `_update()` is overridden so that any transfer where `from != address(0)` and `to != address(0)` throws a custom error `ErrSoulboundTokenLocked(tokenId)`.
- `locked(tokenId)` returns `true`.
- The `Locked(tokenId)` event is emitted upon issuance.

### What is the role of OpenZeppelin `AccessControl`?
Rather than a naive `onlyOwner` modifier, we implement role-based access control (`DEFAULT_ADMIN_ROLE` and `ISSUER_ROLE`). This allows:
- Separation of concerns (Contract Admin vs. Registrar Officers).
- Support for multiple accredited departmental issuing keys.
- Instant role revocation if an issuing officer's private key is compromised.

---

## 3. Cryptography & Hashing

### Why Keccak-256?
Keccak-256 is the native cryptographic hash function of the Ethereum Virtual Machine (EVM). It is collision-resistant and executes with minimal gas cost via EVM opcodes.

### What is Canonicalization and why is it necessary?
In computer science, different JSON serializers may order object keys arbitrarily (e.g. `{"id": 1, "name": "A"}` vs `{"name": "A", "id": 1}`) or include varying whitespace/newlines. If two systems hash differently formatted representations of identical data, the resulting hashes will completely differ (the avalanche effect).

To solve this, we define a deterministic canonical format:
```text
studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType
```
Both the issuer frontend and verifier engine parse data into this exact pipe-delimited string before hashing with Keccak-256.

---

## 4. Privacy by Design & Off-Chain Storage

### Why not store student personal information directly on the blockchain?
1. **Public Visibility**: Anyone can view blockchain state. Storing student GPA, address, and full names on a public ledger violates privacy laws (GDPR, FERPA).
2. **Right to be Forgotten**: Blockchains are permanent; data cannot be erased. Off-chain IPFS storage allows decoupling identity from permanent on-chain state.
3. **Storage Costs**: Storing arbitrary string text in EVM storage slots (`SSTORE`) is extremely expensive (20,000 gas per 32 bytes). Anchoring a single 32-byte hash (`bytes32`) reduces gas by over 90%.

---

## 5. Frequently Asked Examiner Questions & Model Answers

### Q1: "What prevents a student from claiming someone else's credential?"
> **Answer**: The smart contract links each token ID to the recipient's wallet address (`ownerOf(tokenId)`). When a verifier inspects the credential, the system checks that the owner address matches the candidate's wallet. Furthermore, because the token is soulbound, the recipient cannot transfer it to anyone else.

### Q2: "Can a hacker modify the degree grade in the IPFS document?"
> **Answer**: If any actor tampers with the off-chain document (for instance, changing a GPA from 3.0 to 4.0), the verifier portal will recompute the Keccak-256 hash from the modified text. Because cryptographic hash functions possess strong collision resistance, the newly computed hash will not match the immutable `bytes32` fingerprint stored in the smart contract, causing the verification scorecard to fail with **✗ Cryptographic Hash Mismatch**.

### Q3: "What happens when a student loses their private key?"
> **Answer**: Because Soulbound tokens cannot be transferred by the student, key recovery requires registrar intervention. The university registrar revokes the old credential token (`revokeCredential(oldTokenId, "Key compromise")`) and issues a fresh soulbound token to the student's new verified wallet address.

### Q4: "How does this align with UN SDG 4?"
> **Answer**: SDG 4 Target 4.3 guarantees equal, non-discriminatory access to higher education, and Target 4.4 enhances workforce mobility. Traditional verification is slow, bureaucratic, and expensive (apostille fees, manual university inquiries). EduSoulbound provides free, instantaneous verification accessible globally, empowering displaced students, refugees, and graduates to prove qualifications anywhere.
