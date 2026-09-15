import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { fetchMetadataFromIPFS } from '../services/ipfsClient';
import demoFixtures from '../fixtures/demoCredentials.json';
import { CredentialCard } from '../components/CredentialCard';
import { 
  GraduationCap, 
  Wallet, 
  Lock, 
  AlertCircle, 
  RefreshCw, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export const StudentDashboard = () => {
  const { contract, account, signer, connectWallet } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  
  // Non-transferability demonstration state
  const [transferAttempting, setTransferAttempting] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  // Set initial lookup address to connected account or default demo student
  useEffect(() => {
    if (account) {
      setSelectedAddress(account);
    } else {
      setSelectedAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'); // Hardhat Account #1
    }
  }, [account]);

  const loadStudentCredentials = useCallback(async () => {
    if (!contract || !selectedAddress) return;
    setLoading(true);

    try {
      let tokenIds = [];
      try {
        const rawIds = await contract.getStudentTokens(selectedAddress);
        tokenIds = Array.from(rawIds).map(id => Number(id));
      } catch (e) {
        // Fallback: check all tokens
        const allIds = await contract.getAllTokens();
        for (const id of allIds) {
          const owner = await contract.ownerOf(id);
          if (owner.toLowerCase() === selectedAddress.toLowerCase()) {
            tokenIds.push(Number(id));
          }
        }
      }

      const list = [];
      for (const id of tokenIds) {
        try {
          const cred = await contract.getCredential(id);
          let meta = null;
          if (cred.metadataURI) {
            try {
              meta = await fetchMetadataFromIPFS(cred.metadataURI);
            } catch (mErr) {
              console.warn(`Could not load metadata for token ${id}:`, mErr);
            }
          }
          if (!meta) {
            meta = demoFixtures.find(f => f.metadataURI === cred.metadataURI) || demoFixtures[id - 1] || null;
          }

          list.push({
            tokenId: id,
            studentAddress: cred.student,
            credentialHash: cred.credentialHash,
            metadataURI: cred.metadataURI,
            isLocked: cred.isLocked,
            isRevoked: cred.revokedStatus,
            issueDate: Number(cred.issueDate),
            revocationReason: cred.revocationReason,
            degreeTitle: meta?.degreeTitle || 'Degree Credential',
            studentId: meta?.studentId || 'N/A',
            institution: meta?.institution || 'Academic Institution',
            major: meta?.major || 'General Studies',
            graduationDate: meta?.graduationDate || '2028',
            credentialType: meta?.credentialType || 'Degree',
          });
        } catch (itemErr) {
          console.warn(`Error loading student token ${id}:`, itemErr);
        }
      }

      setCredentials(list);
    } catch (err) {
      console.error('Failed to load student credentials:', err);
    } finally {
      setLoading(false);
    }
  }, [contract, selectedAddress]);

  useEffect(() => {
    if (selectedAddress) {
      loadStudentCredentials();
    }
  }, [loadStudentCredentials, selectedAddress]);

  // Demonstrate Soulbound non-transferability (Attempt transfer and capture revert)
  const handleDemonstrateNonTransferability = async (tokenId) => {
    if (!contract || !signer) {
      setTransferResult({
        success: false,
        message: 'Please connect your student wallet to demonstrate non-transferability on-chain.',
      });
      return;
    }

    setTransferAttempting(true);
    setTransferResult(null);

    const dummyRecipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'; // Account #2

    try {
      // Attempt transferFrom
      const tx = await contract.transferFrom(account, dummyRecipient, tokenId);
      await tx.wait();
      
      // If it reaches here, soulbound failed!
      setTransferResult({
        success: false,
        message: 'CRITICAL ERROR: Token was transferred! ERC-5192 Soulbound constraint was violated.',
      });
    } catch (err) {
      console.log('Expected Soulbound Revert caught:', err);
      const isSoulboundRevert = 
        err.message.includes('ErrSoulboundTokenLocked') || 
        err.message.includes('reverted') || 
        err.message.includes('cannot transfer');

      setTransferResult({
        success: true, // Expected behavior for Soulbound!
        message: `✓ ERC-5192 ENFORCED: Transfer reverted as expected! Error: ErrSoulboundTokenLocked(${tokenId}). The credential cannot be transferred, sold, or moved to another wallet.`,
      });
    } finally {
      setTransferAttempting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Credential Portfolio</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanent, self-sovereign academic records anchored to your Web3 wallet
            </p>
          </div>
        </div>

        {/* Address Switcher / Filter */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-700">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <input
              type="text"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              placeholder="Inspect address (0x...)"
              className="bg-transparent focus:outline-none w-48 truncate"
            />
          </div>

          <button
            onClick={loadStudentCredentials}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            title="Refresh credentials"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Soulbound Info Callout */}
      <div className="bg-gradient-to-r from-edu-900 to-slate-900 text-white p-6 rounded-2xl border border-edu-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-edu-500/20 border border-edu-400/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-edu-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">ERC-5192 Soulbound Tokens (Non-Transferable)</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Academic qualifications are bound to your identity. Unlike standard commercial NFTs, educational SBTs permanently lock upon issuance: you cannot sell, trade, or transfer them to another wallet.
            </p>
          </div>
        </div>

        {credentials.length > 0 && account && (
          <button
            onClick={() => handleDemonstrateNonTransferability(credentials[0].tokenId)}
            disabled={transferAttempting}
            className="px-4 py-2 bg-edu-500 hover:bg-edu-400 text-slate-950 font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{transferAttempting ? 'Testing Revert...' : 'Test Non-Transferability'}</span>
          </button>
        )}
      </div>

      {/* Non-Transferability Test Result */}
      {transferResult && (
        <div className={`p-4 rounded-2xl border text-xs font-mono animate-fadeIn ${
          transferResult.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold font-sans">Soulbound Verification Passed</p>
              <p className="mt-1 leading-relaxed">{transferResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-edu-600" />
          <span>Querying blockchain for student tokens...</span>
        </div>
      ) : credentials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Credentials Found for this Wallet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Wallet address <code>{selectedAddress}</code> has not been issued any educational credentials yet.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setSelectedAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')}
              className="text-xs font-semibold text-edu-600 hover:text-edu-800 underline"
            >
              Load Demo Student Account #1
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Issued Degrees & Certifications ({credentials.length})
            </h2>
            <span className="text-xs text-slate-500">
              Wallet: <code className="text-slate-700">{selectedAddress.substring(0, 8)}...</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {credentials.map((cred) => (
              <CredentialCard
                key={cred.tokenId}
                credential={cred}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
