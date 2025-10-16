import { useState, useEffect } from "react";

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance?: string;
}

interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  tokenInfo: TokenInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    chainId: null,
    tokenInfo: null,
    isLoading: false,
    error: null,
  });

  const contractAddress = "0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f";
  const polygonChainId = 137;

  useEffect(() => {
    // Don't auto-connect if user explicitly logged out
    const isLoggedOut = localStorage.getItem('userLoggedOut') === 'true';
    if (!isLoggedOut) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
            chainId: parseInt(chainId, 16),
            tokenInfo: {
              address: contractAddress,
              name: "Parcero Token",
              symbol: "PARCERO",
              decimals: 18,
            }
          }));
          
          await getTokenBalance(accounts[0]);
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to check connection"
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const connectWallet = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error("MetaMask is not installed");
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      if (parseInt(chainId, 16) !== polygonChainId) {
        await switchToPolygon();
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        tokenInfo: {
          address: contractAddress,
          name: "Parcero Token",
          symbol: "PARCERO",
          decimals: 18,
        }
      }));

      // Clear logout state when successfully connecting
      localStorage.removeItem('userLoggedOut');

      await getTokenBalance(accounts[0]);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to connect wallet"
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${polygonChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${polygonChainId.toString(16)}`,
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  const getTokenBalance = async (address: string) => {
    try {
      // ERC-20 balanceOf function selector
      const data = `0x70a08231${address.slice(2).padStart(64, '0')}`;
      
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: data,
        }, 'latest'],
      });

      // Convert hex balance to decimal and format
      const balanceInWei = BigInt(balance);
      const balanceInTokens = Number(balanceInWei) / Math.pow(10, 18);
      
      setState(prev => ({
        ...prev,
        tokenInfo: prev.tokenInfo ? {
          ...prev.tokenInfo,
          balance: balanceInTokens.toFixed(8)
        } : null
      }));
    } catch (error) {
      console.error("Failed to get token balance:", error);
    }
  };

  const disconnectWallet = () => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      tokenInfo: null,
      isLoading: false,
      error: null,
    });
  };

  const openPolygonScan = () => {
    window.open(`https://polygonscan.com/token/${contractAddress}`, '_blank');
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    openPolygonScan,
    refreshBalance: () => state.account && getTokenBalance(state.account),
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
