import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { fetchMetadataFromIPFS } from '../services/ipfsClient';
import demoFixtures from '../fixtures/demoCredentials.json';
import { 
  Building2, 
  PlusCircle, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  X,
  FileText,
  Search
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const IssuerDashboard = () => {
  const { contract, account, isIssuer, getExplorerLink } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Revocation Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);
  const [revokeSuccess, setRevokeSuccess] = useState(null);

  const loadAllCredentials = useCallback(async () => {
    if (!contract) return;
    setLoading(true);

    try {
      let tokenIds = [];
      try {
        const rawIds = await contract.getAllTokens();
        tokenIds = Array.from(rawIds).map(id => Number(id));
      } catch (e) {
        // Fallback: check total issued counter
        const total = await contract.getTotalIssued();
        for (let i = 1; i <= Number(total); i++) {
          tokenIds.push(i);
        }
      }

      const list = [];
      let activeCount = 0;
      let revokedCount = 0;

      for (const id of tokenIds) {
        try {
          const cred = await contract.getCredential(id);
          const isRevoked = cred.revokedStatus;
          if (isRevoked) revokedCount++;
          else activeCount++;

          // Attempt to fetch metadata from IPFS or local fixture
          let meta = demoFixtures[id - 1] || null;
          if (!meta && cred.metadataURI) {
            try {
              meta = await fetchMetadataFromIPFS(cred.metadataURI);
            } catch (err) {
              console.warn(`Could not fetch metadata for token ${id}:`, err);
            }
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
          });
        } catch (itemErr) {
          console.warn(`Error loading credential ${id}:`, itemErr);
        }
      }

      setCredentials(list);
      setStats({
        total: list.length,
        active: activeCount,
        revoked: revokedCount,
      });
    } catch (err) {
      console.error('Failed to load credentials from contract:', err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    loadAllCredentials();
  }, [loadAllCredentials]);

  const handleOpenRevokeModal = (tokenId) => {
    setSelectedTokenId(tokenId);
    setRevokeReason('');
    setRevokeError(null);
    setRevokeSuccess(null);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevocation = async () => {
    if (!contract || !selectedTokenId) return;
    if (!revokeReason.trim()) {
      setRevokeError('Please provide a formal reason for credential revocation.');
      return;
    }

    setRevoking(true);
    setRevokeError(null);
    setRevokeSuccess(null);

    try {
      const tx = await contract.revokeCredential(selectedTokenId, revokeReason.trim());
      await tx.wait();

      setRevokeSuccess(`Credential Token #${selectedTokenId} successfully revoked on-chain.`);
      setTimeout(() => {
        setRevokeModalOpen(false);
        loadAllCredentials();
      }, 1800);
    } catch (err) {
      console.error('Revocation failed:', err);
      if (err.message.includes('AccessControl')) {
        setRevokeError('Unauthorized: Only registered university issuer wallets can revoke credentials.');
      } else {
        setRevokeError(err.reason || err.message || 'Transaction failed in MetaMask.');
      }
    } finally {
      setRevoking(false);
    }
  };

  const filteredCredentials = credentials.filter(c => 
    c.tokenId.toString().includes(searchTerm) ||
    c.studentAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.degreeTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">University Registrar Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized Credential Minting, Revocation & Blockchain Ledger Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllCredentials}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/issuer/issue"
            className="px-4 py-2.5 bg-edu-600 hover:bg-edu-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Credential</span>
          </Link>
        </div>
      </div>

      {/* Warning if not issuer */}
      {account && !isIssuer && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Connected Account is Not an Authorized Issuer</p>
            <p className="text-amber-800">
              The connected wallet (<code>{account}</code>) does not possess the <code>ISSUER_ROLE</code>. You can inspect credentials, but minting or revoking will revert. For local testing, connect with Hardhat Account #0 (<code>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code>).
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credentials Minted</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">ERC-5192 Soulbound Tokens</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-edu-50 text-edu-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active In Good Standing</span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.active}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Verified & Valid</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revoked Credentials</span>
            <p className="text-3xl font-extrabold text-rose-600 mt-2">{stats.revoked}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Audited historical trail</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Issued Credentials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institutional Credential Registry</h2>
            <p className="text-xs text-slate-500 mt-0.5">All educational credentials anchored on the EVM blockchain</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by ID, student, degree..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-edu-600" />
            <span>Auditing blockchain ledger and querying token records...</span>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <p className="font-semibold text-slate-700">No credentials found matching query.</p>
            <p className="mt-1">Mint a new credential using the issue portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Token ID</th>
                  <th className="py-3 px-4">Student & ID</th>
                  <th className="py-3 px-4">Degree & Major</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Conferred</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredCredentials.map((cred) => (
                  <tr key={cred.tokenId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{cred.tokenId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{cred.studentId}</div>
                      <div className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]" title={cred.studentAddress}>
                        {cred.studentAddress}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{cred.degreeTitle}</div>
                      <div className="text-[11px] text-slate-500">{cred.major}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {cred.isRevoked ? (
                        <StatusBadge type="revoked" text="REVOKED" />
                      ) : (
                        <StatusBadge type="valid" text="ACTIVE" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {cred.issueDate ? new Date(cred.issueDate * 1000).toLocaleDateString() : 'Anchored'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/verify?tokenId=${cred.tokenId}`}
                        className="inline-flex items-center gap-1 text-edu-600 hover:text-edu-800 font-semibold text-[11px]"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      {!cred.isRevoked && (
                        <button
                          onClick={() => handleOpenRevokeModal(cred.tokenId)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                        >
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revocation Modal */}
      {revokeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setRevokeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Revoke Credential</h3>
                <p className="text-xs text-slate-500">Token ID #{selectedTokenId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Revocation records a permanent non-compliance status on the EVM blockchain. The historical transaction remains intact for institutional audit, but third-party verifiers will flag this credential as <strong>REVOKED</strong>.
            </p>

            {revokeError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {revokeError}
              </div>
            )}

            {revokeSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                {revokeSuccess}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-700">
                Official Institutional Revocation Reason:
              </label>
              <textarea
                rows="3"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Academic integrity violation, disciplinary misconduct, clerical error..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                disabled={revoking}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocation}
                disabled={revoking}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {revoking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in MetaMask...</span>
                  </>
                ) : (
                  <span>Confirm Revocation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
