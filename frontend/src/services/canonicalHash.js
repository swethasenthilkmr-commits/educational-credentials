import { ethers } from 'ethers';

/**
 * Computes the deterministic canonical string for a credential document.
 * Eliminates formatting ambiguities to ensure identical hashing across issuers and verifiers.
 * 
 * Format: studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType
 * 
 * @param {Object} cred Credential data object
 * @returns {string} Deterministic canonical representation
 */
export function toCanonicalString(cred) {
  if (!cred) return '';
  return [
    (cred.studentId || '').trim(),
    (cred.studentAddress || '').trim().toLowerCase(),
    (cred.degreeTitle || '').trim(),
    (cred.major || '').trim(),
    (cred.institution || '').trim(),
    (cred.graduationDate || '').trim(),
    (cred.credentialType || 'Degree').trim(),
  ].join('|');
}

/**
 * Generates the Keccak-256 cryptographic hash (bytes32 hex string) from the canonical credential.
 * 
 * @param {Object} cred Credential data object
 * @returns {string} 0x-prefixed 32-byte hash
 */
export function computeCredentialHash(cred) {
  const canonical = toCanonicalString(cred);
  return ethers.keccak256(ethers.toUtf8Bytes(canonical));
}

/**
 * Verifies if recomputed hash of metadata matches the on-chain cryptographic anchor.
 * 
 * @param {Object} metadata The off-chain credential metadata object
 * @param {string} onChainHash The bytes32 hash stored on the blockchain
 * @returns {boolean} True if hashes match exactly
 */
export function verifyCredentialHash(metadata, onChainHash) {
  if (!metadata || !onChainHash) return false;
  const recomputed = computeCredentialHash(metadata);
  return recomputed.toLowerCase() === onChainHash.toLowerCase();
}
