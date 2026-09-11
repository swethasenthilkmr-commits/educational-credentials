import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Lock, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { QRCodeModal } from './QRCodeModal';

export const CredentialCard = ({ credential, onRevokeClick, canRevoke = false }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!credential) return null;

  const {
    tokenId,
    studentId,
    studentAddress,
    studentName,
    degreeTitle,
    major,
    institution,
    graduationDate,
    credentialType,
    isRevoked,
    isLocked = true,
    credentialHash,
    metadataURI,
    issueDate,
    revocationReason,
  } = credential;

  const handleCopyWallet = () => {
    if (!studentAddress) return;
    navigator.clipboard.writeText(studentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedIssueDate = issueDate 
    ? new Date(Number(issueDate) * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Anchored on-chain';

  return (
    <>
      <div className={`relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between ${
        isRevoked 
          ? 'border-rose-300 shadow-rose-100/50' 
          : 'border-slate-200 shadow-slate-100/60 hover:border-edu-300'
      }`}>
        
        {/* Top Decorative Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isRevoked 
            ? 'bg-gradient-to-r from-rose-900 to-rose-700' 
            : 'bg-gradient-to-r from-slate-900 via-edu-950 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-edu-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-edu-200 font-semibold">
                {institution || 'University Credential'}
              </p>
              <h3 className="text-xs font-mono text-white/90">
                SBT Token ID #{tokenId}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isRevoked ? (
              <StatusBadge type="revoked" text="REVOKED" />
            ) : (
              <StatusBadge type="valid" text="VALID" />
            )}
            <StatusBadge type="soulbound" text="SOULBOUND" />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-4 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-edu-600 bg-edu-50 px-2 py-0.5 rounded border border-edu-200">
              {credentialType || 'Official Degree'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
              {degreeTitle || 'Bachelor of Technology'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Major in {major || 'Computer Science'}
            </p>
          </div>

          {/* Student & Anchor Meta */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Student ID</span>
              <span className="font-semibold text-slate-800">{studentId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Conferred Date</span>
              <span className="font-semibold text-slate-800">{graduationDate || '2028'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[11px]">Student Wallet (Non-transferable)</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
                <span className="truncate">{studentAddress}</span>
                <button
                  onClick={handleCopyWallet}
                  title="Copy student address"
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Revocation notice if revoked */}
          {isRevoked && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Revocation Notice:</span>
              </p>
              <p className="mt-1 text-[11px] text-rose-700">{revocationReason || 'This credential has been revoked by the institution.'}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Show QR</span>
          </button>

          <Link
            to={`/verify?tokenId=${tokenId}&student=${studentAddress || ''}`}
            className="px-3 py-1.5 bg-edu-600 hover:bg-edu-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify</span>
          </Link>

          {canRevoke && !isRevoked && (
            <button
              onClick={() => onRevokeClick && onRevokeClick(tokenId)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Revoke</span>
            </button>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        credential={credential}
        tokenId={tokenId}
      />
    </>
  );
};
