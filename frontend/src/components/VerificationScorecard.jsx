import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Database, 
  KeyRound, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const VerificationScorecard = ({ verificationData }) => {
  if (!verificationData) return null;

  const {
    tokenId,
    tokenExists,
    ownerMatches,
    isLocked,
    isRevoked,
    metadataRetrieved,
    hashMatched,
    metadata,
    onChainHash,
    computedHash,
    expectedOwner,
    actualOwner,
    issueDate,
    revocationReason,
    ipfsUri,
  } = verificationData;

  const isAllValid = tokenExists && ownerMatches && isLocked && !isRevoked && metadataRetrieved && hashMatched;

  const checks = [
    {
      id: 'exists',
      title: 'Token Exists On-Chain',
      description: `Smart contract confirms token ID #${tokenId} was minted.`,
      status: tokenExists ? 'pass' : 'fail',
      icon: Database,
    },
    {
      id: 'owner',
      title: 'Student Wallet Ownership Verified',
      description: ownerMatches 
        ? `Owner matches: ${actualOwner?.substring(0, 6)}...${actualOwner?.substring(actualOwner.length - 4)}` 
        : `Ownership mismatch. Registered to: ${actualOwner || 'None'}`,
      status: ownerMatches ? 'pass' : 'fail',
      icon: UserCheck,
    },
    {
      id: 'soulbound',
      title: 'ERC-5192 Soulbound Status (Non-Transferable)',
      description: isLocked 
        ? 'locked(tokenId) == true. Credential cannot be transferred or traded.' 
        : 'Token is unlocked or transferrable (Violation of Soulbound requirement)',
      status: isLocked ? 'pass' : 'fail',
      icon: Lock,
    },
    {
      id: 'revocation',
      title: 'Revocation State Check',
      description: isRevoked 
        ? `Credential has been REVOKED by registrar. Reason: "${revocationReason || 'Institutional revocation'}"` 
        : 'Credential is active in good standing; not revoked.',
      status: !isRevoked ? 'pass' : 'revoked',
      icon: AlertTriangle,
    },
    {
      id: 'ipfs',
      title: 'IPFS Metadata Retrieval',
      description: metadataRetrieved 
        ? `Successfully resolved canonical metadata JSON from ${ipfsUri?.substring(0, 26)}...` 
        : 'Failed to retrieve metadata from IPFS gateway.',
      status: metadataRetrieved ? 'pass' : 'fail',
      icon: Database,
    },
    {
      id: 'hash',
      title: 'Cryptographic Keccak-256 Hash Matching',
      description: hashMatched 
        ? 'Off-chain canonical document hash matches the immutable on-chain fingerprint.' 
        : 'CRYPTOGRAPHIC HASH MISMATCH! Document content may have been tampered with.',
      status: hashMatched ? 'pass' : 'fail',
      icon: KeyRound,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
      {/* Overall Status Banner */}
      <div className={`p-6 border-b text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isRevoked 
          ? 'bg-gradient-to-r from-rose-700 to-rose-600' 
          : isAllValid 
            ? 'bg-gradient-to-r from-emerald-700 to-emerald-600' 
            : 'bg-gradient-to-r from-amber-700 to-amber-600'
      }`}>
        <div className="flex items-center gap-3">
          {isRevoked ? (
            <div className="w-12 h-12 rounded-full bg-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          ) : isAllValid ? (
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isRevoked 
                ? 'CREDENTIAL REVOKED' 
                : isAllValid 
                  ? 'CREDENTIAL AUTHENTIC & VERIFIED' 
                  : 'CREDENTIAL VERIFICATION FAILED'}
            </h2>
            <p className="text-xs text-white/80">
              Token ID #{tokenId} • {metadata?.degreeTitle || 'Degree Credential'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRevoked && <StatusBadge type="revoked" text="REVOKED" />}
          {isLocked && <StatusBadge type="soulbound" text="SOULBOUND (LOCKED)" />}
          {hashMatched && <StatusBadge type="hash-match" text="HASH VERIFIED" />}
        </div>
      </div>

      {/* 6-Point Itemized Checklist */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Itemized 6-Point Verification Checklist</span>
          <span className="text-xs font-normal text-slate-500 lowercase">(independent smart contract & IPFS validation)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
          {checks.map((check) => {
            const Icon = check.icon;
            const isPass = check.status === 'pass';
            const isRev = check.status === 'revoked';

            return (
              <div 
                key={check.id} 
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  isRev 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : isPass 
                      ? 'bg-emerald-50/60 border-emerald-200' 
                      : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isRev ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  ) : isPass ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{check.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{check.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cryptographic Comparison Section */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
            Cryptographic Hash Verification Detail
          </h4>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>On-Chain Hash (Anchored in Smart Contract):</span>
              <span className="text-emerald-700 font-bold font-sans">Immutable</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 break-all select-all">
              {onChainHash || 'N/A'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Recomputed Hash (From IPFS Canonical Serialization):</span>
              <span className={hashMatched ? 'text-emerald-700 font-bold font-sans' : 'text-rose-700 font-bold font-sans'}>
                {hashMatched ? '✓ Match' : '✗ Mismatch'}
              </span>
            </div>
            <div className={`p-2.5 rounded border break-all select-all ${
              hashMatched ? 'bg-white text-slate-800 border-slate-200' : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              {computedHash || 'N/A'}
            </div>
          </div>
        </div>

        {/* IPFS Reference */}
        {ipfsUri && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>IPFS Metadata Reference:</span>
            <span className="font-mono text-edu-700 truncate max-w-xs">{ipfsUri}</span>
          </div>
        )}
      </div>
    </div>
  );
};
