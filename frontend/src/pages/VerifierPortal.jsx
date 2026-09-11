import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { computeCredentialHash, verifyCredentialHash } from '../services/canonicalHash';
import { fetchMetadataFromIPFS } from '../services/ipfsClient';
import demoFixtures from '../fixtures/demoCredentials.json';
import { VerificationScorecard } from '../components/VerificationScorecard';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  QrCode, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Lock,
  Upload
} from 'lucide-react';

export const VerifierPortal = () => {
  const [searchParams] = useSearchParams();
  const { contract } = useWeb3();

  // Search Inputs
  const [tokenIdInput, setTokenIdInput] = useState('');
  const [studentAddressInput, setStudentAddressInput] = useState('');
  
  // Verification Processing State
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  // Execute Verification
  const performVerification = useCallback(async (tokenIdToVerify, expectedStudent = '') => {
    if (!contract) return;
    if (!tokenIdToVerify || isNaN(Number(tokenIdToVerify))) {
      setError('Please enter a valid numeric Token ID.');
      return;
    }

    const id = Number(tokenIdToVerify);
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Step 1: Query smart contract on EVM blockchain
      let cred;
      try {
        cred = await contract.getCredential(id);
      } catch (contractErr) {
        throw new Error(`Token ID #${id} does not exist on the blockchain ledger.`);
      }

      const actualOwner = cred.student;
      const onChainHash = cred.credentialHash;
      const metadataURI = cred.metadataURI;
      const isLocked = cred.isLocked;
      const isRevoked = cred.revokedStatus;
      const issueDate = Number(cred.issueDate);
      const revocationReason = cred.revocationReason;

      // Check owner match if expectedStudent is specified
      const cleanExpected = expectedStudent ? expectedStudent.trim().toLowerCase() : '';
      const ownerMatches = cleanExpected 
        ? actualOwner.toLowerCase() === cleanExpected 
        : true;

      // Step 2: Fetch metadata from IPFS
      let metadata = null;
      let metadataRetrieved = false;

      // Check demo fixtures first for offline viva robustness
      if (demoFixtures[id - 1]) {
        metadata = demoFixtures[id - 1];
        metadataRetrieved = true;
      }

      if (!metadata && metadataURI) {
        try {
          metadata = await fetchMetadataFromIPFS(metadataURI);
          metadataRetrieved = true;
        } catch (ipfsErr) {
          console.warn('IPFS retrieval failed:', ipfsErr);
          metadataRetrieved = false;
        }
      }

      // Step 3: Compute Canonical Hash & Verify
      let computedHash = 'N/A';
      let hashMatched = false;

      if (metadata) {
        // Ensure student address matches actual owner in canonical form
        const docForHashing = {
          ...metadata,
          studentAddress: actualOwner,
        };
        computedHash = computeCredentialHash(docForHashing);
        hashMatched = computedHash.toLowerCase() === onChainHash.toLowerCase();
      }

      setVerificationResult({
        tokenId: id,
        tokenExists: true,
        ownerMatches,
        isLocked,
        isRevoked,
        metadataRetrieved,
        hashMatched,
        metadata,
        onChainHash,
        computedHash,
        expectedOwner: cleanExpected,
        actualOwner,
        issueDate,
        revocationReason,
        ipfsUri: metadataURI,
      });

    } catch (err) {
      console.error('Verification failed:', err);
      setError(err.message || 'Verification could not be completed.');
    } finally {
      setIsVerifying(false);
    }
  }, [contract]);

  // Read URL query parameters on initial mount (e.g. from QR scan)
  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    const urlStudent = searchParams.get('student');

    if (urlTokenId) {
      setTokenIdInput(urlTokenId);
      if (urlStudent) setStudentAddressInput(urlStudent);
      performVerification(urlTokenId, urlStudent || '');
    }
  }, [searchParams, performVerification]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performVerification(tokenIdInput, studentAddressInput);
  };

  const handleQuickLookup = (id) => {
    setTokenIdInput(id.toString());
    performVerification(id, '');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-edu-50 text-edu-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Verify an Educational Credential</h1>
        <p className="text-sm text-slate-600 mt-2">
          Independent cryptographic audit against the immutable EVM blockchain and IPFS decentralized storage. Zero login, zero fees.
        </p>
      </div>

      {/* Verification Lookup Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Token ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Credential Token ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 1"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-edu-500/20 font-mono"
              />
            </div>

            {/* Student Wallet Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Wallet Address <span className="text-slate-400 font-normal">(Optional Ownership Check)</span>
              </label>
              <input
                type="text"
                placeholder="0x... (matches owner to recipient)"
                value={studentAddressInput}
                onChange={(e) => setStudentAddressInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-edu-500/20 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Quick Demo Verification:</span>
              <button
                type="button"
                onClick={() => handleQuickLookup(1)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
              >
                #1 Degree
              </button>
              <button
                type="button"
                onClick={() => handleQuickLookup(2)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
              >
                #2 Diploma
              </button>
              <button
                type="button"
                onClick={() => handleQuickLookup(3)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
              >
                #3 B.Sc
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full sm:w-auto px-6 py-2.5 bg-edu-600 hover:bg-edu-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Ledger...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Audit & Verify Credential</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Credential Lookup Failed</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Verification Scorecard Output */}
      {verificationResult && (
        <VerificationScorecard verificationData={verificationResult} />
      )}

    </div>
  );
};
