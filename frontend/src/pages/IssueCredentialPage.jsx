import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { computeCredentialHash, toCanonicalString } from '../services/canonicalHash';
import { uploadMetadataToIPFS } from '../services/ipfsClient';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Lock,
  AlertTriangle
} from 'lucide-react';

export const IssueCredentialPage = () => {
  const navigate = useNavigate();
  const { contract, account, isIssuer } = useWeb3();

  // Form Fields
  const [formData, setFormData] = useState({
    studentId: 'STU-2024-104',
    studentAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat Account #1
    studentName: 'Devika Nair', // Off-chain metadata only!
    degreeTitle: 'Bachelor of Technology in Computer Science and Engineering',
    major: 'Decentralized Systems & Cryptography',
    institution: 'Metropolitan University of Technology',
    graduationDate: '2028-05-15',
    credentialType: 'Degree',
    gpa: '3.95 / 4.0',
    honors: 'Summa Cum Laude',
  });

  // Workflow Pipeline State: 'idle' | 'hashing' | 'uploading' | 'minting' | 'success'
  const [step, setStep] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // Results State
  const [result, setResult] = useState({
    tokenId: null,
    credentialHash: null,
    ipfsUri: null,
    txHash: null,
    canonicalString: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadDemoData = (presetIndex = 1) => {
    if (presetIndex === 1) {
      setFormData({
        studentId: 'STU-2024-104',
        studentAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        studentName: 'Devika Nair',
        degreeTitle: 'Bachelor of Technology in Computer Science and Engineering',
        major: 'Decentralized Systems & Cryptography',
        institution: 'Metropolitan University of Technology',
        graduationDate: '2028-05-15',
        credentialType: 'Degree',
        gpa: '3.95 / 4.0',
        honors: 'Summa Cum Laude',
      });
    } else {
      setFormData({
        studentId: 'STU-2024-205',
        studentAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Hardhat Account #2
        studentName: 'Rohan Varma',
        degreeTitle: 'Postgraduate Diploma in Cloud Architecture',
        major: 'DevOps & Distributed Security',
        institution: 'Metropolitan University of Technology',
        graduationDate: '2029-01-20',
        credentialType: 'Diploma',
        gpa: '4.0 / 4.0',
        honors: 'Dean\'s Medal',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      setError('Please connect your Web3 wallet before issuing credentials.');
      return;
    }

    if (!formData.studentAddress || !formData.studentAddress.startsWith('0x') || formData.studentAddress.length !== 42) {
      setError('Please provide a valid 42-character EVM student wallet address.');
      return;
    }

    setError(null);
    setStep('hashing');
    setStatusMessage('Constructing canonical credential representation & computing Keccak-256 fingerprint...');

    try {
      // 1. Canonical Serialization & Cryptographic Hash
      const canonical = toCanonicalString(formData);
      const credHash = computeCredentialHash(formData);

      // 2. IPFS Metadata Upload
      setStep('uploading');
      setStatusMessage('Uploading canonical credential metadata JSON to IPFS...');

      const metadataPayload = {
        ...formData,
        credentialHash: credHash,
        version: '1.0',
        issuedAt: new Date().toISOString(),
        standard: 'ERC-5192 Soulbound Educational Credential',
      };

      const ipfsResult = await uploadMetadataToIPFS(metadataPayload);
      const metadataURI = ipfsResult.uri;

      // 3. Mint Soulbound Token on EVM Blockchain
      setStep('minting');
      setStatusMessage('Please confirm the Soulbound Token minting transaction in MetaMask...');

      const tx = await contract.safeMintSBT(
        formData.studentAddress,
        metadataURI,
        credHash
      );

      setStatusMessage('Awaiting blockchain block confirmation...');
      const receipt = await tx.wait();

      // Parse minted token ID from CredentialIssued event
      let mintedTokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'CredentialIssued') {
            mintedTokenId = Number(parsed.args.tokenId);
            break;
          }
        } catch (parseErr) {
          // Continue searching logs
        }
      }

      // Fallback query if needed
      if (!mintedTokenId) {
        const total = await contract.getTotalIssued();
        mintedTokenId = Number(total);
      }

      setResult({
        tokenId: mintedTokenId,
        credentialHash: credHash,
        ipfsUri: metadataURI,
        txHash: receipt.hash,
        canonicalString: canonical,
      });

      setStep('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

    } catch (err) {
      console.error('Credential issuance failed:', err);
      setStep('idle');
      if (err.message && err.message.includes('AccessControl')) {
        setError('Unauthorized: Your wallet does not hold the ISSUER_ROLE. Connect with the university registrar account.');
      } else if (err.code === 4001 || (err.message && err.message.includes('rejected'))) {
        setError('Transaction was rejected in MetaMask.');
      } else {
        setError(err.reason || err.message || 'Transaction failed on the blockchain.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/issuer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registrar Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Quick Test Autofill:</span>
          <button
            type="button"
            onClick={() => handleLoadDemoData(1)}
            className="px-2.5 py-1 bg-edu-50 hover:bg-edu-100 text-edu-700 border border-edu-200 rounded text-xs font-medium transition"
          >
            Demo Graduate 1
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemoData(2)}
            className="px-2.5 py-1 bg-edu-50 hover:bg-edu-100 text-edu-700 border border-edu-200 rounded text-xs font-medium transition"
          >
            Demo Graduate 2
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-edu-50 text-edu-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Issue Soulbound Educational Credential</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ERC-5192 Non-Transferable Degree Anchoring Pipeline
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Permanent Soulbound Lock</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Issuance Error</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Success View */}
      {step === 'success' ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-lg text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Soulbound Credential Issued Successfully!</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The academic degree is now permanently anchored on the blockchain and bound to the student's wallet address.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 max-w-2xl mx-auto border border-slate-200 text-left font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Token ID:</span>
              <span className="font-bold text-edu-700 text-sm">#{result.tokenId}</span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block mb-1">Keccak-256 Cryptographic Hash:</span>
              <span className="bg-white p-2 rounded border border-slate-200 text-slate-800 block break-all text-[11px]">
                {result.credentialHash}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block mb-1">IPFS Metadata URI:</span>
              <span className="bg-white p-2 rounded border border-slate-200 text-edu-700 block break-all text-[11px]">
                {result.ipfsUri}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block mb-1">Transaction Hash:</span>
              <span className="bg-white p-2 rounded border border-slate-200 text-slate-700 block break-all text-[11px]">
                {result.txHash}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to={`/verify?tokenId=${result.tokenId}`}
              className="px-6 py-2.5 bg-edu-600 hover:bg-edu-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Credential Scorecard</span>
            </Link>

            <Link
              to="/student"
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <span>View in Student Portal</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setStep('idle');
                handleLoadDemoData(2);
              }}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition"
            >
              Issue Another Credential
            </button>
          </div>
        </div>
      ) : (
        /* Issuance Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student & Academic Program Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal student identifiers are packaged into IPFS JSON metadata. Only the cryptographic hash is anchored on the ledger.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student ID Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g. STU-2024-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>

              {/* Student Full Name (Off-chain) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student Full Name <span className="text-slate-400 font-normal">(Off-chain Metadata)</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>

              {/* Student Wallet Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student EVM Wallet Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentAddress"
                  required
                  value={formData.studentAddress}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The Soulbound Token will be minted directly to this address. Transfers from this address are cryptographically disallowed.
                </p>
              </div>

              {/* Degree Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Degree / Award Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="degreeTitle"
                  required
                  value={formData.degreeTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Bachelor of Technology in Computer Science and Engineering"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>

              {/* Major / Specialization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Major / Specialization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="major"
                  required
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder="e.g. Artificial Intelligence & Blockchain"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>

              {/* Credential Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Credential Classification
                </label>
                <select
                  name="credentialType"
                  value={formData.credentialType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                >
                  <option value="Degree">Degree (B.Tech, B.S., M.S., Ph.D.)</option>
                  <option value="Diploma">Postgraduate Diploma</option>
                  <option value="Certificate">Executive Certificate</option>
                </select>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Conferring Institution <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="institution"
                  required
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="e.g. Metropolitan University of Technology"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>

              {/* Graduation Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Conferral / Graduation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="graduationDate"
                  required
                  value={formData.graduationDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
                />
              </div>
            </div>

            {/* Pipeline Status Indicator */}
            {step !== 'idle' && (
              <div className="p-4 bg-edu-50 border border-edu-200 rounded-xl flex items-center gap-3 animate-pulse text-xs text-edu-900">
                <RefreshCw className="w-5 h-5 animate-spin text-edu-600 shrink-0" />
                <span className="font-semibold">{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Only authorized addresses with <code>ISSUER_ROLE</code> can sign and mint credentials.
            </p>

            <button
              type="submit"
              disabled={step !== 'idle'}
              className="px-6 py-2.5 bg-edu-600 hover:bg-edu-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {step !== 'idle' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Generate Hash & Mint SBT</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
