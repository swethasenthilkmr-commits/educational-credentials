import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Download } from 'lucide-react';

export const QRCodeModal = ({ isOpen, onClose, credential, tokenId }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !credential) return null;

  const origin = window.location.origin;
  const verificationUrl = `${origin}/verify?tokenId=${tokenId || credential.tokenId || 1}&student=${credential.studentAddress || credential.student || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svgElement = document.getElementById('credential-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Credential_Token_${tokenId || 'SBT'}_QR.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-edu-50 text-edu-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Credential Verification QR</h3>
          <p className="text-xs text-slate-500 mt-1">
            Token ID #{tokenId || credential.tokenId} • {credential.degreeTitle}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl border border-slate-200/80 mb-6">
          <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
            <QRCodeSVG
              id="credential-qr-svg"
              value={verificationUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-3 max-w-xs">
            Scan with any camera or verifier device to independently inspect on-chain soulbound validity and IPFS metadata.
          </p>
        </div>

        {/* URL Box */}
        <div className="bg-slate-100 p-2.5 rounded-lg flex items-center justify-between text-xs text-slate-600 mb-5 font-mono">
          <span className="truncate mr-2">{verificationUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white rounded text-slate-700 transition shrink-0"
            title="Copy verification link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="w-full py-2 px-3 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download SVG</span>
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 bg-edu-600 text-white rounded-lg text-xs font-semibold hover:bg-edu-700 flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Verifier</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
