const networks = {
  BSC: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
    testnetRpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorerUrl: 'https://bscscan.com',
    testnetExplorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    tokens: {
      USDT: {
        address: '0x55d398326f99059fF775485246999027B3197955',
        testnetAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
        decimals: 18,
        symbol: 'USDT'
      },
      USDC: {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        testnetAddress: '0x64544969ed7EBf5f083679233325356EbE738930',
        decimals: 18,
        symbol: 'USDC'
      }
    }
  },
  
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/' + (process.env.INFURA_PROJECT_ID || ''),
    testnetRpcUrl: process.env.ETH_TESTNET_RPC_URL || 'https://sepolia.infura.io/v3/' + (process.env.INFURA_PROJECT_ID || ''),
    explorerUrl: 'https://etherscan.io',
    testnetExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    tokens: {
      USDT: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        testnetAddress: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        decimals: 6,
        symbol: 'USDT'
      },
      USDC: {
        address: '0xA0b86a33E6441b8435b662303c0f479c7e1d5916',
        testnetAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        decimals: 6,
        symbol: 'USDC'
      }
    }
  },
  
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com',
    testnetRpcUrl: process.env.SOL_TESTNET_RPC_URL || 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    testnetExplorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    },
    tokens: {
      USDT: {
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        testnetAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        decimals: 6,
        symbol: 'USDT'
      },
      USDC: {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        testnetAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        decimals: 6,
        symbol: 'USDC'
      }
    }
  },
  
  POLYGON: {
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    testnetRpcUrl: process.env.POLYGON_TESTNET_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://polygonscan.com',
    testnetExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    },
    tokens: {
      USDT: {
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        testnetAddress: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
        decimals: 6,
        symbol: 'USDT'
      },
      USDC: {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        testnetAddress: '0xdA5289fCAAF71d52a80A254da614a192b693e977',
        decimals: 6,
        symbol: 'USDC'
      }
    }
  }
};

const getNetworkConfig = (networkName, isTestnet = false) => {
  const network = networks[networkName.toUpperCase()];
  if (!network) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  return {
    ...network,
    rpcUrl: isTestnet ? network.testnetRpcUrl : network.rpcUrl,
    explorerUrl: isTestnet ? network.testnetExplorerUrl : network.explorerUrl,
    tokens: Object.fromEntries(
      Object.entries(network.tokens || {}).map(([symbol, token]) => [
        symbol,
        {
          ...token,
          address: isTestnet ? token.testnetAddress : token.address
        }
      ])
    )
  };
};

const getSupportedNetworks = () => {
  return Object.keys(networks);
};

const getSupportedTokens = (networkName) => {
  const network = networks[networkName.toUpperCase()];
  return network ? Object.keys(network.tokens || {}) : [];
};

const validateNetworkAndToken = (network, token) => {
  const supportedNetworks = getSupportedNetworks();
  if (!supportedNetworks.includes(network.toUpperCase())) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${supportedNetworks.join(', ')}`);
  }
  
  const supportedTokens = getSupportedTokens(network);
  if (token && !supportedTokens.includes(token.toUpperCase())) {
    throw new Error(`Unsupported token: ${token} on ${network}. Supported tokens: ${supportedTokens.join(', ')}`);
  }
  
  return true;
};

module.exports = {
  networks,
  getNetworkConfig,
  getSupportedNetworks,
  getSupportedTokens,
  validateNetworkAndToken
};
