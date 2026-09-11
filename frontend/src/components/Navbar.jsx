import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { 
  GraduationCap, 
  Wallet, 
  ShieldCheck, 
  UserCheck, 
  FileCheck, 
  BookOpen, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { 
    account, 
    chainId, 
    isIssuer, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    SUPPORTED_NETWORKS 
  } = useWeb3();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Registrar Portal', path: '/issuer' },
    { name: 'Student Portal', path: '/student' },
    { name: 'Verify Credential', path: '/verify' },
    { name: 'SDG 4 & Viva', path: '/about' },
  ];

  const currentNetwork = SUPPORTED_NETWORKS[chainId];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-edu-700 to-edu-500 flex items-center justify-center text-white shadow-md shadow-edu-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">EduSoulbound</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  SDG 4
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Decentralized Academic Credentials</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-edu-50 text-edu-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action: Network & Wallet */}
          <div className="flex items-center gap-2.5">
            {/* Network Indicator */}
            {account && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <div className={`w-2 h-2 rounded-full ${currentNetwork ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{currentNetwork ? currentNetwork.name : 'Unknown Network'}</span>
              </div>
            )}

            {/* Role Badge */}
            {account && (
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {isIssuer ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Registrar</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student / Holder</span>
                  </>
                )}
              </div>
            )}

            {/* Wallet Connect / Disconnect */}
            {account ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-700 transition">
                  <Wallet className="w-4 h-4 text-edu-600" />
                  <span>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-edu-600 hover:bg-edu-700 active:bg-edu-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
