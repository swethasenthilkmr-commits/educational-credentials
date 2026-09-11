import { ethers } from 'ethers';

// Fallback in-memory storage for demo session
const localIpfsCache = new Map();

// Helper to save to browser localStorage for persistence across reloads
function saveToLocalStorage(cid, data) {
  try {
    localStorage.setItem(`ipfs_content_${cid}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Unable to cache IPFS content in localStorage:', e);
  }
}

function getFromLocalStorage(cid) {
  try {
    const raw = localStorage.getItem(`ipfs_content_${cid}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Uploads credential metadata to IPFS (via Pinata or local simulated IPFS for offline demos).
 * 
 * @param {Object} metadata The credential metadata JSON object
 * @returns {Promise<{ cid: string, uri: string, gatewayUrl: string, isSimulated: boolean }>}
 */
export async function uploadMetadataToIPFS(metadata) {
  const pinataJwt = import.meta.env.VITE_PINATA_JWT;
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
  const pinataSecret = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (pinataJwt || (pinataApiKey && pinataSecret)) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (pinataJwt) {
        headers['Authorization'] = `Bearer ${pinataJwt}`;
      } else {
        headers['pinata_api_key'] = pinataApiKey;
        headers['pinata_secret_api_key'] = pinataSecret;
      }

      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `Credential_${metadata.studentId || 'edu'}.json`,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const cid = data.IpfsHash;
        saveToLocalStorage(cid, metadata);
        return {
          cid,
          uri: `ipfs://${cid}`,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn('Pinata upload failed, falling back to simulated IPFS:', err);
    }
  }

  // Simulated Deterministic CID (Offline / Local Dev Fallback)
  // Generates a valid-looking IPFS CID based on sha256 of JSON string
  const jsonStr = JSON.stringify(metadata);
  const hashBytes = ethers.sha256(ethers.toUtf8Bytes(jsonStr));
  const pseudoCid = 'bafkrei' + hashBytes.slice(2, 54);

  // Store in cache
  localIpfsCache.set(pseudoCid, metadata);
  saveToLocalStorage(pseudoCid, metadata);

  return {
    cid: pseudoCid,
    uri: `ipfs://${pseudoCid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${pseudoCid}`,
    isSimulated: true,
  };
}

/**
 * Fetches credential metadata from IPFS or local simulated storage.
 * 
 * @param {string} ipfsUri IPFS URI (e.g. ipfs://CID or CID string)
 * @returns {Promise<Object>} The parsed JSON metadata
 */
export async function fetchMetadataFromIPFS(ipfsUri) {
  if (!ipfsUri) throw new Error('Missing IPFS URI');

  const cid = ipfsUri.replace(/^ipfs:\/\//, '').trim();

  // 1. Check local in-memory cache
  if (localIpfsCache.has(cid)) {
    return localIpfsCache.get(cid);
  }

  // 2. Check browser localStorage
  const localData = getFromLocalStorage(cid);
  if (localData) {
    localIpfsCache.set(cid, localData);
    return localData;
  }

  // 3. Attempt public gateways
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];

  for (const gw of gateways) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

      const res = await fetch(gw, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        saveToLocalStorage(cid, data);
        localIpfsCache.set(cid, data);
        return data;
      }
    } catch (e) {
      // Continue to next gateway
    }
  }

  throw new Error(`Unable to resolve IPFS CID: ${cid} across public gateways or local cache.`);
}
