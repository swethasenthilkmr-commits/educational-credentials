import React from 'react';
import { CheckCircle2, AlertTriangle, Lock, ShieldCheck, XCircle } from 'lucide-react';

export const StatusBadge = ({ type, text }) => {
  switch (type) {
    case 'valid':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {text || 'VALID'}
        </span>
      );
    case 'soulbound':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Lock className="w-3.5 h-3.5" />
          {text || 'ERC-5192 SOULBOUND'}
        </span>
      );
    case 'revoked':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          {text || 'REVOKED'}
        </span>
      );
    case 'hash-match':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          {text || 'HASH MATCHED'}
        </span>
      );
    case 'invalid':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle className="w-3.5 h-3.5" />
          {text || 'UNKNOWN'}
        </span>
      );
  }
};
