# Smart Contract Documentation: EducationalCredential.sol

## 1. Overview & Standard Compliance

`EducationalCredential.sol` is an EVM smart contract implementing an **ERC-5192 Minimal Soulbound Token (SBT)** with metadata URI storage, cryptographic hash anchoring, and role-based revocation.

- **Solidity Version**: `^0.8.24` (with Cancun EVM target)
- **Inheritance Hierarchy**:
  - `ERC721URIStorage` (OpenZeppelin Contracts v5)
  - `AccessControl` (OpenZeppelin Contracts v5)
  - `IERC5192` (Minimal Soulbound Standard Interface)
- **ERC-165 Interface IDs**:
  - ERC-721: `0x80ac58cd`
  - ERC-5192: `0xb45a3c0e`
  - AccessControl: `0x7965db0b`

---

## 2. Soulbound Non-Transferability Mechanism

In OpenZeppelin Contracts v5, all token transfers, mints, and burns execute through the internal hook:

```solidity
function _update(
    address to,
    uint256 tokenId,
    address auth
) internal virtual override returns (address)
```

### Transfer Enforcement Logic:
- **Minting Allowed**: When a token is created, `from == address(0)` and `to == studentAddress`. The contract allows minting.
- **Transfer Prohibited**: If `from != address(0)` and `to != address(0)`, any transfer between normal accounts is attempted. The contract explicitly reverts:
  ```solidity
  if (from != address(0) && to != address(0)) {
      revert ErrSoulboundTokenLocked(tokenId);
  }
  ```
- **ERC-5192 `locked(uint256 tokenId)` Function**:
  ```solidity
  function locked(uint256 tokenId) external view override returns (bool) {
      if (_ownerOf(tokenId) == address(0)) revert ErrTokenDoesNotExist(tokenId);
      return true;
  }
  ```
  Returns `true` for all valid tokens, certifying permanent non-transferability.

---

## 3. Access Control Roles

1. `DEFAULT_ADMIN_ROLE`:
   - Held by contract deployer.
   - Authorizes granting or revoking roles (`grantRole`, `revokeRole`).
2. `ISSUER_ROLE`:
   - `keccak256("ISSUER_ROLE")`
   - Authorized to mint new credentials (`safeMintSBT`).
   - Authorized to revoke existing credentials (`revokeCredential`).

---

## 4. Key Functions

### `safeMintSBT`
```solidity
function safeMintSBT(
    address student,
    string memory metadataURI,
    bytes32 credentialHash
) external onlyRole(ISSUER_ROLE) returns (uint256)
```
- **Parameters**:
  - `student`: Wallet address of the graduate.
  - `metadataURI`: IPFS URI pointing to off-chain JSON document (`ipfs://CID`).
  - `credentialHash`: 32-byte Keccak-256 cryptographic hash of canonical credential document.
- **Emits**: `Locked(tokenId)`, `CredentialIssued(...)`.
- **Returns**: Minted `tokenId`.

### `revokeCredential`
```solidity
function revokeCredential(
    uint256 tokenId,
    string memory reason
) external onlyRole(ISSUER_ROLE)
```
- **Parameters**:
  - `tokenId`: Identifier of the credential to revoke.
  - `reason`: Explanation recorded on-chain for the audit trail.
- **Emits**: `CredentialRevoked(tokenId, issuer, reason, timestamp)`.

### `getCredential`
```solidity
function getCredential(uint256 tokenId)
    external
    view
    returns (
        address student,
        bytes32 credentialHash,
        string memory metadataURI,
        bool isLocked,
        bool revokedStatus,
        uint256 issueDate,
        string memory revocationReason
    )
```
Returns complete structured state for verification scorecard engines.

---

## 5. Custom Errors
- `ErrSoulboundTokenLocked(uint256 tokenId)`: Thrown on attempted transfers.
- `ErrTokenAlreadyRevoked(uint256 tokenId)`: Thrown if an issuer tries to revoke an already revoked credential.
- `ErrInvalidStudentAddress()`: Thrown if student address is `address(0)`.
- `ErrEmptyCredentialHash()`: Thrown if hash is `bytes32(0)`.
- `ErrEmptyMetadataURI()`: Thrown if IPFS URI is empty string.
- `ErrTokenDoesNotExist(uint256 tokenId)`: Thrown if querying an unminted token ID.
