import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const NetworkBanner = () => {
  const { account, chainId, switchNetwork, SUPPORTED_NETWORKS } = useWeb3();

  if (!account) return null;

  const isSupported = Boolean(SUPPORTED_NETWORKS[chainId]);

  if (isSupported) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            <strong>Unsupported Network Detected (Chain ID: {chainId || 'Unknown'}).</strong> Please connect to Hardhat Localhost (31337) or Ethereum Sepolia (11155111).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => switchNetwork(31337)}
            className="px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>Switch to Localhost</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => switchNetwork(11155111)}
            className="px-3 py-1 bg-slate-900/80 text-white hover:bg-slate-900 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>Switch to Sepolia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
