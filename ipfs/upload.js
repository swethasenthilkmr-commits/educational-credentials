/**
 * IPFS Upload and Canonical Hash Utility
 * Handles deterministic canonical serialization, Keccak-256 hashing,
 * and uploading to IPFS via Pinata SDK or HTTP API.
 */
const { ethers } = require("ethers");
require("dotenv").config();

/**
 * Computes the deterministic canonical string for a credential.
 * Format: studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType
 */
function toCanonicalString(cred) {
  return [
    (cred.studentId || "").trim(),
    (cred.studentAddress || "").trim().toLowerCase(),
    (cred.degreeTitle || "").trim(),
    (cred.major || "").trim(),
    (cred.institution || "").trim(),
    (cred.graduationDate || "").trim(),
    (cred.credentialType || "Degree").trim(),
  ].join("|");
}

/**
 * Generates Keccak-256 hash from canonical credential string.
 */
function computeCredentialHash(cred) {
  const canonical = toCanonicalString(cred);
  return ethers.keccak256(ethers.toUtf8Bytes(canonical));
}

/**
 * Uploads credential metadata to IPFS via Pinata or returns simulated deterministic CID.
 */
async function uploadToIPFS(metadata) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecret = process.env.PINATA_SECRET_API_KEY;
  const pinataJwt = process.env.PINATA_JWT;

  if (pinataJwt || (pinataApiKey && pinataSecret)) {
    try {
      console.log("Uploading metadata to Pinata IPFS service...");
      const headers = {
        "Content-Type": "application/json",
      };
      if (pinataJwt) {
        headers["Authorization"] = `Bearer ${pinataJwt}`;
      } else {
        headers["pinata_api_key"] = pinataApiKey;
        headers["pinata_secret_api_key"] = pinataSecret;
      }

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers,
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `EducationalCredential_${metadata.studentId || "student"}.json`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed with status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;
      console.log("Uploaded successfully to Pinata! CID:", ipfsHash);
      return {
        cid: ipfsHash,
        uri: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      };
    } catch (err) {
      console.warn("Pinata upload failed, falling back to simulated CID:", err.message);
    }
  }

  // Local simulated deterministic IPFS CID generation for offline viva demos
  const contentBytes = ethers.toUtf8Bytes(JSON.stringify(metadata));
  const pseudoCid = "bafybei" + ethers.keccak256(contentBytes).substring(2, 54);
  console.log("Using simulated deterministic IPFS CID (Offline Demo Mode):", pseudoCid);

  return {
    cid: pseudoCid,
    uri: `ipfs://${pseudoCid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${pseudoCid}`,
    isSimulated: true,
  };
}

module.exports = {
  toCanonicalString,
  computeCredentialHash,
  uploadToIPFS,
};
