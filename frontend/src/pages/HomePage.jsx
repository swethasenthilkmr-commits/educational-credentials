import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  Search, 
  ArrowRight, 
  Database, 
  CheckCircle2, 
  FileCheck2, 
  Building2, 
  UserCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const HomePage = () => {
  const [quickSearchId, setQuickSearchId] = useState('');
  const navigate = useNavigate();

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickSearchId.trim()) return;
    navigate(`/verify?tokenId=${quickSearchId.trim()}`);
  };

  return (
    <div className="space-y-24 py-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 rounded-3xl bg-gradient-to-b from-edu-50 via-white to-slate-50 border border-edu-100/80 px-6 sm:px-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-edu-100/70 text-edu-800 text-xs font-semibold border border-edu-200 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-edu-600" />
          <span>Aligned with UN Sustainable Development Goal 4 (Target 4.3 & 4.4)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Cryptographically Anchored <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-edu-600 to-indigo-600 bg-clip-text text-transparent">
            Educational Credentials
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mt-6 font-normal leading-relaxed">
          Secure. Verifiable. Student-Owned. Powered by ERC-5192 Soulbound Tokens, Keccak-256 cryptographic hashing, and IPFS.
        </p>

        {/* Quick Verification Search Box */}
        <div className="max-w-xl mx-auto mt-10">
          <form onSubmit={handleQuickVerify} className="flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Enter Token ID (e.g. 1) or Student Wallet Address..."
              value={quickSearchId}
              onChange={(e) => setQuickSearchId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-edu-600 hover:bg-edu-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm shrink-0"
            >
              <span>Verify Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span>Quick test token IDs:</span>
            <button onClick={() => navigate('/verify?tokenId=1')} className="underline hover:text-edu-600">#1 (Degree)</button>
            <span>•</span>
            <button onClick={() => navigate('/verify?tokenId=2')} className="underline hover:text-edu-600">#2 (Diploma)</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            to="/issuer"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Registrar Portal</span>
          </Link>
          <Link
            to="/student"
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-edu-600" />
            <span>Student Portal</span>
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 bg-edu-50 hover:bg-edu-100 text-edu-700 border border-edu-200 rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            <span>SDG 4 Alignment & Viva Guide</span>
          </Link>
        </div>
      </section>

      {/* Core Roles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Three-Tier Web3 Architecture</h2>
          <p className="text-slate-600 text-sm mt-2">
            Seamlessly interconnecting university registrars, lifelong learners, and institutional employers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Role 1: Registrar */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. University Registrar</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Authorized Issuer</p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Connects registered university wallet, enters graduate details, generates canonical hash, pins metadata to IPFS, and mints permanent Soulbound credentials.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link to="/issuer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Enter Registrar Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Role 2: Student */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Student Holder</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">SBT Owner (Non-Transferable)</p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Holds credentials in their personal Web3 wallet forever. Generates tamper-proof QR codes, proves qualifications without manual transcripts, and cannot transfer tokens.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link to="/student" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                <span>View Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Role 3: Verifier */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-edu-50 text-edu-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Third-Party Verifier</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Employers & Universities</p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Zero-friction public lookup requiring no gas or login. Scans QR or inputs Token ID, audits smart contract lock state, and cryptographically checks IPFS hash matches.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link to="/verify" className="text-xs font-bold text-edu-600 hover:text-edu-800 flex items-center gap-1">
                <span>Open Verifier Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Flow Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-edu-400">Cryptographic Protocol Flow</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">How It Works: Privacy by Design</h2>
            <p className="text-slate-400 text-sm mt-2">
              No sensitive student PII is written to the public blockchain. Only the cryptographic hash (Keccak-256) and soulbound state are anchored on-chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-edu-500/20 text-edu-400 flex items-center justify-center font-bold text-sm mb-4">1</div>
              <h4 className="font-bold text-sm text-white">Registrar Issuance</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Registrar inputs student ID, degree, and wallet address. The system standardizes a deterministic canonical representation.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">2</div>
              <h4 className="font-bold text-sm text-white">Keccak-256 & IPFS</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Calculates cryptographic hash <code className="text-indigo-300">H_doc</code>. Metadata JSON is pinned to IPFS, generating an immutable CID.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">3</div>
              <h4 className="font-bold text-sm text-white">Soulbound Minting</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Smart contract mints an ERC-5192 SBT to student's wallet. Transfer attempts revert. Permanent lock event is emitted.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">4</div>
              <h4 className="font-bold text-sm text-white">Instant Verification</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Verifier inspects smart contract for locked and non-revoked status, fetches IPFS metadata, and verifies hash matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UN SDG 4 Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white rounded-3xl p-8 sm:p-12 border border-rose-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-800/80 text-rose-200 text-xs font-bold border border-rose-700">
              <span>UN Sustainable Development Goal 4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Empowering Lifelong Learning & Eradicating Credential Fraud
            </h2>
            <p className="text-sm text-rose-200 leading-relaxed">
              Target 4.3 guarantees equal access to affordable vocational and higher education. By removing costly manual background verification and safeguarding credentials against university closures or displacement, decentralized soulbound tokens make academic achievements universally recognized and self-sovereign.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/about"
              className="px-6 py-3 bg-white hover:bg-rose-50 text-rose-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2"
            >
              <span>Explore SDG 4 Impact</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
