// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IERC5192.sol";

/**
 * @title EducationalCredential
 * @notice Soulbound (non-transferable) educational credential token compliant with ERC-5192.
 * @dev Anchors academic degrees/diplomas to student wallets with Keccak-256 cryptographic hashes
 *      and IPFS metadata, aligned with UN SDG 4 Quality Education.
 */
contract EducationalCredential is ERC721URIStorage, AccessControl, IERC5192 {
    // --- Access Control Roles ---
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // --- State Variables ---
    uint256 private _nextTokenId;

    // Mapping from tokenId to the off-chain credential's Keccak-256 cryptographic hash
    mapping(uint256 => bytes32) private _credentialHashes;

    // Mapping from tokenId to revocation status
    mapping(uint256 => bool) private _revokedTokens;

    // Mapping from tokenId to revocation reason
    mapping(uint256 => string) private _revocationReasons;

    // Mapping from tokenId to issuance timestamp
    mapping(uint256 => uint256) private _issueDates;

    // Mapping from student wallet address to array of owned tokenIds
    mapping(address => uint256[]) private _studentTokens;

    // Array of all minted token IDs for institutional enumeration
    uint256[] private _allTokenIds;

    // --- Custom Errors (Viva-friendly & gas-efficient) ---
    error ErrSoulboundTokenLocked(uint256 tokenId);
    error ErrTokenAlreadyRevoked(uint256 tokenId);
    error ErrInvalidStudentAddress();
    error ErrEmptyCredentialHash();
    error ErrEmptyMetadataURI();
    error ErrTokenDoesNotExist(uint256 tokenId);

    // --- Events ---
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed issuer,
        bytes32 credentialHash,
        string metadataURI,
        uint256 issueDate
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed issuer,
        string reason,
        uint256 revocationDate
    );

    /**
     * @notice Constructor initializes the ERC721 token and grants admin and issuer roles.
     * @param initialAdmin Address of the initial registrar / contract administrator.
     */
    constructor(address initialAdmin) ERC721("Educational Soulbound Credential", "EDUSBT") {
        if (initialAdmin == address(0)) {
            revert ErrInvalidStudentAddress();
        }
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ISSUER_ROLE, initialAdmin);
    }

    /**
     * @notice Mints a soulbound credential to a student's wallet address.
     * @dev Only callable by an account with ISSUER_ROLE.
     * @param student The recipient student wallet address.
     * @param metadataURI The IPFS URI (e.g. ipfs://CID) containing off-chain credential metadata.
     * @param credentialHash The 32-byte Keccak-256 hash of the canonical credential document.
     * @return tokenId The newly minted credential token ID.
     */
    function safeMintSBT(
        address student,
        string memory metadataURI,
        bytes32 credentialHash
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        if (student == address(0)) revert ErrInvalidStudentAddress();
        if (credentialHash == bytes32(0)) revert ErrEmptyCredentialHash();
        if (bytes(metadataURI).length == 0) revert ErrEmptyMetadataURI();

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        // Mint token to student wallet
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store credential verification metadata
        _credentialHashes[tokenId] = credentialHash;
        _issueDates[tokenId] = block.timestamp;
        _studentTokens[student].push(tokenId);
        _allTokenIds.push(tokenId);

        // Emit ERC-5192 standard Locked event
        emit Locked(tokenId);

        // Emit institutional issuance event
        emit CredentialIssued(
            tokenId,
            student,
            msg.sender,
            credentialHash,
            metadataURI,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @notice Revokes an issued credential (e.g. academic misconduct or clerical error).
     * @dev Does NOT burn or erase the token from blockchain history; marks it revoked.
     * @param tokenId The identifier of the credential to revoke.
     * @param reason Human-readable reason for revocation.
     */
    function revokeCredential(
        uint256 tokenId,
        string memory reason
    ) external onlyRole(ISSUER_ROLE) {
        if (_ownerOf(tokenId) == address(0)) revert ErrTokenDoesNotExist(tokenId);
        if (_revokedTokens[tokenId]) revert ErrTokenAlreadyRevoked(tokenId);

        _revokedTokens[tokenId] = true;
        _revocationReasons[tokenId] = reason;

        emit CredentialRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice ERC-5192 Soulbound standard: Returns whether a token is locked.
     * @dev In this educational credential framework, all valid credentials are permanently locked.
     * @param tokenId The identifier for the credential token.
     * @return True if the token exists and is locked.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        if (_ownerOf(tokenId) == address(0)) revert ErrTokenDoesNotExist(tokenId);
        return true;
    }

    /**
     * @notice Hook that is called before any token transfer, including minting and burning.
     * @dev Overridden in OpenZeppelin v5 to enforce Soulbound (non-transferable) behavior.
     *      Allows minting (from == address(0)), but reverts on any transfer between accounts.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Disallow transfer between normal accounts (Soulbound constraint)
        if (from != address(0) && to != address(0)) {
            revert ErrSoulboundTokenLocked(tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Checks whether a credential has been revoked.
     * @param tokenId The identifier of the credential.
     */
    function isRevoked(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) revert ErrTokenDoesNotExist(tokenId);
        return _revokedTokens[tokenId];
    }

    /**
     * @notice Returns complete credential verification details.
     * @param tokenId The identifier of the credential.
     */
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
    {
        student = _ownerOf(tokenId);
        if (student == address(0)) revert ErrTokenDoesNotExist(tokenId);

        credentialHash = _credentialHashes[tokenId];
        metadataURI = tokenURI(tokenId);
        isLocked = true;
        revokedStatus = _revokedTokens[tokenId];
        issueDate = _issueDates[tokenId];
        revocationReason = _revocationReasons[tokenId];
    }

    /**
     * @notice Returns all token IDs issued to a specific student wallet.
     * @param student The wallet address of the student.
     */
    function getStudentTokens(address student) external view returns (uint256[] memory) {
        return _studentTokens[student];
    }

    /**
     * @notice Returns total number of credentials ever issued.
     */
    function getTotalIssued() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Returns all token IDs ever issued (useful for registrar dashboard).
     */
    function getAllTokens() external view returns (uint256[] memory) {
        return _allTokenIds;
    }

    /**
     * @dev Standard ERC-165 interface detection.
     *      Supports ERC721, AccessControl, and ERC-5192 (0xb45a3c0e).
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
