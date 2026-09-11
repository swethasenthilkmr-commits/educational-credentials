// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC5192: Minimal Soulbound NFTs Interface
 * @notice Standard interface for Soulbound Tokens as defined in EIP-5192.
 * @dev See https://eips.ethereum.org/EIPS/eip-5192
 */
interface IERC5192 {
    /// @notice Emitted when the locking status of a token is changed to locked.
    /// @dev If a token is minted and at the same time locked, this event should be emitted.
    /// @param tokenId The identifier for token that is locked.
    event Locked(uint256 tokenId);

    /// @notice Emitted when the locking status of a token is changed to unlocked.
    /// @dev If a token is minted and at the same time unlocked, this event should be emitted.
    /// @param tokenId The identifier for token that is unlocked.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of a Soulbound Token.
    /// @dev Tokens assigned to zero address are considered invalid, and queries about them throw.
    /// @param tokenId The identifier for an SBT.
    function locked(uint256 tokenId) external view returns (bool);
}
