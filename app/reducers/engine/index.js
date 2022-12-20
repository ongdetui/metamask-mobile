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
              {
                rpcUrl: 'https://polygon-mainnet.infura.io/v3/undefined',
                chainId: '137',
                ticker: 'MATIC',
                nickname: 'Polygon Mainnet',
                rpcPrefs: {
                  blockExplorerUrl: 'https://polygonscan.com',
                },
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
          {
            rpcUrl: 'https://polygon-mainnet.infura.io/v3/undefined',
            chainId: '137',
            ticker: 'MATIC',
            nickname: 'Polygon Mainnet',
            rpcPrefs: {
              blockExplorerUrl: 'https://polygonscan.com',
            },
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
        ],
      };
      return newState;
    }
    default:
      return state;
  }
};

export default engineReducer;
