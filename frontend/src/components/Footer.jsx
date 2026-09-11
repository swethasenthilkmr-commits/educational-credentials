import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Heart, ExternalLink, ShieldAlert, BookOpen, GraduationCap } from 'lucide-react';

export const Footer = () => {
  const { contractAddress, getExplorerLink } = useWeb3();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Project Overview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <GraduationCap className="w-6 h-6 text-edu-400" />
              <span>EduSoulbound Platform</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A decentralized, ERC-5192 Soulbound educational credential framework designed to eliminate degree forgery, empower lifelong student ownership, and enable instant zero-cost verification.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 max-w-md">
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong className="text-white">UN SDG 4:</strong> Target 4.3 & 4.4 — Ensuring equal access to affordable quality higher education & workforce skills.
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/" className="hover:text-edu-400 transition">Overview</a></li>
              <li><a href="/issuer" className="hover:text-edu-400 transition">University Registrar</a></li>
              <li><a href="/student" className="hover:text-edu-400 transition">Student Credentials</a></li>
              <li><a href="/verify" className="hover:text-edu-400 transition">Public Verifier</a></li>
              <li><a href="/about" className="hover:text-edu-400 transition">SDG 4 & Viva Guide</a></li>
            </ul>
          </div>

          {/* Column 3: Tech & Standards */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-edu-400" />
                <span>ERC-5192 Soulbound (SBT)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-edu-400" />
                <span>Keccak-256 Fingerprinting</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-edu-400" />
                <span>IPFS Canonical Metadata</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-edu-400" />
                <span>OpenZeppelin AccessControl</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contract Address Bar */}
        {contractAddress && (
          <div className="pt-6 pb-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Contract Address:</span>
              <code className="bg-slate-800 px-2 py-1 rounded text-edu-300 font-mono text-[11px]">
                {contractAddress}
              </code>
            </div>
            {getExplorerLink(contractAddress, 'address') && (
              <a
                href={getExplorerLink(contractAddress, 'address')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-edu-400 hover:text-edu-300 transition"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Bottom copyright & academic disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-2">
          <p>
            Undergraduate 2nd-Year Engineering Project • Open-Source Academic Demonstration Prototype.
          </p>
          <p className="text-[11px] text-slate-600">
            Privacy by Design: No sensitive student PII is written to the public blockchain ledger.
          </p>
        </div>
      </div>
    </footer>
  );
};
