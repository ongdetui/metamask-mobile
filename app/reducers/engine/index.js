import Engine from '../../core/Engine';

const initialState = {
  backgroundState: {},
};

const engineReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INIT_BG_STATE':
      return {
        backgroundState: {
          ...Engine.state,
          PreferencesController: {
            ...Engine.state.PreferencesController,
            frequentRpcList: [
              // ...Engine.state.PreferencesController.frequentRpcList,
              {
                rpcUrl:
                  'https://polygon-mainnet.infura.io/v3/258ae281a1a941fc9d5af896b4c5781c',
                chainId: '137',
                ticker: 'MATIC',
                nickname: 'Polygon Mainnet',
                rpcPrefs: {
                  blockExplorerUrl: 'https://polygonscan.com',
                  imageUrl: 'MATIC',
                },
                formattedRpcUrl: 'https://polygon-mainnet.infura.io/v3',
              },
              {
                rpcUrl: 'https://bsc-dataseed1.binance.org/',
                chainId: '56',
                ticker: 'BNB',
                nickname: 'BNB Smart Chain',
                rpcPrefs: {
                  blockExplorerUrl: 'https://bscscan.com',
                },
              },
              {
                rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                chainId: '97',
                ticker: 'BNB',
                nickname: 'BNB Smart Chain - Testnet',
                rpcPrefs: {
                  blockExplorerUrl: 'https://testnet.bscscan.com',
                },
              },
              {
                rpcUrl:
                  'https://polygon-mumbai.infura.io/v3/258ae281a1a941fc9d5af896b4c5781c',
                chainId: '80001',
                ticker: 'MATIC',
                nickname: 'Mumbai Testnet',
                rpcPrefs: {
                  blockExplorerUrl: 'https://polygonscan.com/',
                },
              },
            ],
          },
        },
      };
    case 'UPDATE_BG_STATE': {
      const newState = { ...state };
      newState.backgroundState[action.key] = Engine.state[action.key];
      newState.backgroundState.PreferencesController = {
        ...Engine.state.PreferencesController,
        frequentRpcList: [
          // ...Engine.state.PreferencesController.frequentRpcList,
          {
            rpcUrl:
              'https://polygon-mainnet.infura.io/v3/258ae281a1a941fc9d5af896b4c5781c',
            chainId: '137',
            ticker: 'MATIC',
            nickname: 'Polygon Mainnet',
            rpcPrefs: {
              blockExplorerUrl: 'https://polygonscan.com',
              imageUrl: 'MATIC',
            },
            formattedRpcUrl: 'https://polygon-mainnet.infura.io/v3',
          },
          {
            rpcUrl: 'https://bsc-dataseed1.binance.org/',
            chainId: '56',
            ticker: 'BNB',
            nickname: 'BNB Smart Chain',
            rpcPrefs: {
              blockExplorerUrl: 'https://bscscan.com',
            },
          },
          {
            rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            chainId: '97',
            ticker: 'BNB',
            nickname: 'BNB Smart Chain - Testnet',
            rpcPrefs: {
              blockExplorerUrl: 'https://testnet.bscscan.com',
            },
          },
          {
            rpcUrl:
              'https://polygon-mumbai.infura.io/v3/258ae281a1a941fc9d5af896b4c5781c',
            chainId: '80001',
            ticker: 'MATIC',
            nickname: 'Mumbai Testnet',
            rpcPrefs: {
              blockExplorerUrl: 'https://polygonscan.com/',
            },
          },
        ],
      };
      return newState;
    }
    default:
      return state;
  }
};

export default engineReducer;
