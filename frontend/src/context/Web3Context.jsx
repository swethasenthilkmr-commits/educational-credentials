import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import contractAddressData from '../contracts/contractAddress.json';
import contractAbiData from '../contracts/EducationalCredential.json';

const Web3Context = createContext();

// Default target network: Localhost (31337) or Sepolia (11155111)
const SUPPORTED_NETWORKS = {
  31337: {
    name: 'Hardhat Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: null,
  },
  11155111: {
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io',
  },
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [contractAddress, setContractAddress] = useState(contractAddressData.address || '');

  // Keep a ref to the latest contract for event callbacks without re-triggering effects
  const contractRef = useRef(null);
  contractRef.current = contract;

  // Initialize read-only provider and contract
  const initReadOnlyContract = useCallback(() => {
    try {
      let readProvider;
      if (window.ethereum) {
        readProvider = new ethers.BrowserProvider(window.ethereum);
      } else {
        const rpcUrl = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
        readProvider = new ethers.JsonRpcProvider(rpcUrl);
      }

      if (contractAddress && contractAbiData.abi) {
        const readContract = new ethers.Contract(
          contractAddress,
          contractAbiData.abi,
          readProvider
        );
        setContract(readContract);
        return readContract;
      }
    } catch (e) {
      console.warn('Could not initialize read-only contract:', e);
    }
    return null;
  }, [contractAddress]);

  // Check roles for the current account
  const checkRoles = useCallback(async (activeContract, userAddress) => {
    if (!activeContract || !userAddress) {
      setIsIssuer(false);
      setIsAdmin(false);
      return;
    }
    try {
      const ISSUER_ROLE = await activeContract.ISSUER_ROLE();
      const DEFAULT_ADMIN_ROLE = await activeContract.DEFAULT_ADMIN_ROLE();

      const [hasIssuer, hasAdmin] = await Promise.all([
        activeContract.hasRole(ISSUER_ROLE, userAddress).catch(() => false),
        activeContract.hasRole(DEFAULT_ADMIN_ROLE, userAddress).catch(() => false),
      ]);

      setIsIssuer(Boolean(hasIssuer));
      setIsAdmin(Boolean(hasAdmin));
    } catch (e) {
      console.warn('Error checking contract roles:', e);
      setIsIssuer(false);
      setIsAdmin(false);
    }
  }, []);

  // Connect MetaMask or browser Web3 wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask or a Web3 compatible browser wallet was not detected. Please install MetaMask.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      const userSigner = await browserProvider.getSigner();
      const currentChainId = Number(network.chainId);

      setAccount(accounts[0]);
      setChainId(currentChainId);
      setProvider(browserProvider);
      setSigner(userSigner);

      if (contractAddress && contractAbiData.abi) {
        const activeContract = new ethers.Contract(
          contractAddress,
          contractAbiData.abi,
          userSigner
        );
        setContract(activeContract);
        await checkRoles(activeContract, accounts[0]);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      if (err.code === 4001) {
        setError('Connection request was rejected in MetaMask.');
      } else {
        setError(err.message || 'Failed to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsIssuer(false);
    setIsAdmin(false);
    initReadOnlyContract();
  };

  // Switch network helper
  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    const hexChainId = '0x' + targetChainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 && targetChainId === 31337) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: 'Hardhat Localhost',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            },
          ],
        });
      } else {
        setError(`Failed to switch network: ${switchError.message}`);
      }
    }
  };

  // Eager Auto-Connect if wallet is already unlocked
  useEffect(() => {
    if (!window.ethereum) return;

    let isMounted = true;
    window.ethereum.request({ method: 'eth_accounts' })
      .then(async (accounts) => {
        if (!isMounted || !accounts || accounts.length === 0) {
          initReadOnlyContract();
          return;
        }

        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const network = await browserProvider.getNetwork();
          const userSigner = await browserProvider.getSigner();
          const currentChainId = Number(network.chainId);

          if (!isMounted) return;
          setAccount(accounts[0]);
          setChainId(currentChainId);
          setProvider(browserProvider);
          setSigner(userSigner);

          if (contractAddress && contractAbiData.abi) {
            const activeContract = new ethers.Contract(
              contractAddress,
              contractAbiData.abi,
              userSigner
            );
            setContract(activeContract);
            await checkRoles(activeContract, accounts[0]);
          }
        } catch (e) {
          console.warn('Auto-connect setup error:', e);
          initReadOnlyContract();
        }
      })
      .catch(() => {
        initReadOnlyContract();
      });

    return () => {
      isMounted = false;
    };
  }, [contractAddress, checkRoles, initReadOnlyContract]);

  // Single event listener registration on mount (fixes EventEmitter memory leak)
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        if (contractRef.current) {
          await checkRoles(contractRef.current, accounts[0]);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkRoles]);

  // Explorer link generator
  const getExplorerLink = (txOrAddress, type = 'tx') => {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network || !network.explorer) return null;
    return `${network.explorer}/${type}/${txOrAddress}`;
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        contract,
        contractAddress,
        setContractAddress,
        isIssuer,
        isAdmin,
        isConnecting,
        error,
        setError,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getExplorerLink,
        SUPPORTED_NETWORKS,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
