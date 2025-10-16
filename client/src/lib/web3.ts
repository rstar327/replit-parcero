export const POLYGON_CONFIG = {
  chainId: 137,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

export const PARCERO_TOKEN = {
  address: '0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f',
  name: 'Parcero Token',
  symbol: 'PARCERO',
  decimals: 18,
  polygonScanUrl: 'https://polygonscan.com/token/0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f',
};

// ERC-20 ABI (minimal)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
];

export class Web3Service {
  private ethereum: any;

  constructor() {
    this.ethereum = (window as any).ethereum;
  }

  async isConnected(): Promise<boolean> {
    if (!this.ethereum) return false;
    
    try {
      const accounts = await this.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  async connect(): Promise<string[]> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await this.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    await this.switchToPolygon();
    return accounts;
  }

  async switchToPolygon(): Promise<void> {
    const hexChainId = `0x${POLYGON_CONFIG.chainId.toString(16)}`;
    
    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await this.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: hexChainId,
            chainName: POLYGON_CONFIG.chainName,
            nativeCurrency: POLYGON_CONFIG.nativeCurrency,
            rpcUrls: POLYGON_CONFIG.rpcUrls,
            blockExplorerUrls: POLYGON_CONFIG.blockExplorerUrls,
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    const data = `0x70a08231${address.slice(2).padStart(64, '0')}`;
    
    const result = await this.ethereum.request({
      method: 'eth_call',
      params: [{
        to: PARCERO_TOKEN.address,
        data: data,
      }, 'latest'],
    });

    const balanceInWei = BigInt(result);
    const balanceInTokens = Math.floor(Number(balanceInWei) / Math.pow(10, PARCERO_TOKEN.decimals));
    
    return balanceInTokens.toString();
  }

  async getChainId(): Promise<number> {
    const chainId = await this.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  }

  async getAccounts(): Promise<string[]> {
    return await this.ethereum.request({ method: 'eth_accounts' });
  }

  // Format address for display
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Convert token amount to Wei
  toWei(amount: string): string {
    const value = parseFloat(amount);
    return (BigInt(Math.floor(value * Math.pow(10, PARCERO_TOKEN.decimals)))).toString();
  }

  // Convert Wei to token amount
  fromWei(wei: string): string {
    const value = BigInt(wei);
    return Math.floor(Number(value) / Math.pow(10, PARCERO_TOKEN.decimals)).toString();
  }
}

export const web3Service = new Web3Service();
