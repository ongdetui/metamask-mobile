import { swapsUtils } from '@metamask/swaps-controller';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  Alert,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { toggleReceiveModal } from '../../../actions/modals';
import { newAssetTransaction } from '../../../actions/transaction';
import Routes from '../../../constants/navigation/Routes';
import Analytics from '../../../core/Analytics/Analytics';
import AppConstants from '../../../core/AppConstants';
import DeeplinkManager from '../../../core/DeeplinkManager';
import Engine from '../../../core/Engine';
import {
  swapsLivenessSelector,
  swapsTokensObjectSelector,
} from '../../../reducers/swaps';
import { getTokenList } from '../../../reducers/tokens';
import { fontStyles } from '../../../styles/common';
import {
  importAccountFromPrivateKey,
  safeToChecksumAddress,
} from '../../../util/address';
import AnalyticsV2 from '../../../util/analyticsV2';
import Logger from '../../../util/Logger';
import { isTestNet } from '../../../util/networks';
import {
  balanceToFiat,
  hexToBN,
  renderFromTokenMinimalUnit,
  renderFromWei,
  weiToFiat,
} from '../../../util/number';
import { mockTheme, ThemeContext } from '../../../util/theme';
import { getEther } from '../../../util/transactions';
import TokenImage from '../../UI/TokenImage';
import AssetActionButton from '../AssetActionButton';
import NetworkMainAssetLogo from '../NetworkMainAssetLogo';

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border.muted,
      alignContent: 'center',
      alignItems: 'center',
      paddingBottom: 30,
    },
    assetLogo: {
      marginTop: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginBottom: 10,
    },
    ethLogo: {
      width: 70,
      height: 70,
    },
    balance: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    amount: {
      fontSize: 30,
      color: colors.text.default,
      ...fontStyles.normal,
      textTransform: 'uppercase',
    },
    testNetAmount: {
      fontSize: 30,
      color: colors.text.default,
      ...fontStyles.normal,
    },
    amountFiat: {
      fontSize: 18,
      color: colors.text.alternative,
      ...fontStyles.light,
      textTransform: 'uppercase',
    },
    actions: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexDirection: 'row',
    },
    warning: {
      borderRadius: 8,
      color: colors.text.default,
      ...fontStyles.normal,
      fontSize: 14,
      lineHeight: 20,
      borderWidth: 1,
      borderColor: colors.warning.default,
      backgroundColor: colors.warning.muted,
      padding: 20,
    },
    warningLinks: {
      color: colors.primary.default,
    },

    btnScan: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

/**
 * View that displays the information of a specific asset (Token or ETH)
 * including the overview (Amount, Balance, Symbol, Logo)
 */
class AssetOverview extends PureComponent {
  static propTypes = {
    /**
     * Map of accounts to information objects including balances
     */
    accounts: PropTypes.object,
    /**
    /* navigation object required to access the props
    /* passed by the parent component
    */
    navigation: PropTypes.object,
    /**
     * Object that represents the asset to be displayed
     */
    asset: PropTypes.object,
    /**
     * ETH to current currency conversion rate
     */
    conversionRate: PropTypes.number,
    /**
     * Currency code of the currently-active currency
     */
    currentCurrency: PropTypes.string,
    /**
     * A string that represents the selected address
     */
    selectedAddress: PropTypes.string,
    /**
     * Start transaction with asset
     */
    newAssetTransaction: PropTypes.func,
    /**
     * An object containing token balances for current account and network in the format address => balance
     */
    tokenBalances: PropTypes.object,
    /**
     * An object containing token exchange rates in the format address => exchangeRate
     */
    tokenExchangeRates: PropTypes.object,
    /**
     * Action that toggles the receive modal
     */
    toggleReceiveModal: PropTypes.func,
    /**
     * Primary currency, either ETH or Fiat
     */
    primaryCurrency: PropTypes.string,
    /**
     * Chain id
     */
    chainId: PropTypes.string,
    /**
     * Wether Swaps feature is live or not
     */
    // swapsIsLive: PropTypes.bool,
    /**
     * Object that contains swaps tokens addresses as key
     */
    // swapsTokens: PropTypes.object,
    /**
     * Network ticker
     */
    ticker: PropTypes.string,
    /**
     * Object that contains tokens by token addresses as key
     */
    tokenList: PropTypes.object,
  };

  onReceive = () => {
    const { asset } = this.props;
    this.props.toggleReceiveModal(asset);
  };

  onBuy = () => {
    this.props.navigation.navigate(Routes.FIAT_ON_RAMP_AGGREGATOR.ID);
    InteractionManager.runAfterInteractions(() => {
      Analytics.trackEventWithParameters(
        AnalyticsV2.ANALYTICS_EVENTS.BUY_BUTTON_CLICKED,
        {
          text: 'Buy',
          location: 'Token Screen',
          chain_id_destination: this.props.chainId,
        },
      );
    });
  };

  onSend = async () => {
    const { asset, ticker } = this.props;
    if (asset.isETH) {
      this.props.newAssetTransaction(getEther(ticker));
      this.props.navigation.navigate('SendFlowView');
    } else {
      this.props.newAssetTransaction(asset);
      this.props.navigation.navigate('SendFlowView');
    }
  };

  goToSwaps = () => {
    this.props.navigation.navigate('Swaps', {
      screen: 'SwapsAmountView',
      params: {
        sourceToken: this.props.asset.isETH
          ? swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS
          : this.props.asset.address,
      },
    });
  };

  goToBrowserUrl(url) {
    this.props.navigation.navigate(Routes.BROWSER_TAB_HOME, {
      screen: Routes.BROWSER_VIEW,
      params: {
        newTabUrl: url,
        timestamp: Date.now(),
      },
    });
  }

  renderLogo = () => {
    const { tokenList, asset } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return asset.isETH ? (
      <NetworkMainAssetLogo biggest style={styles.ethLogo} />
    ) : (
      <TokenImage asset={asset} tokenList={tokenList} />
    );
  };

  componentDidMount = async () => {
    const { SwapsController } = Engine.context;
    try {
      await SwapsController.fetchTokenWithCache();
    } catch (error) {
      Logger.error(
        error,
        'Swaps: error while fetching tokens with cache in AssetOverview',
      );
    }
  };

  renderWarning = () => {
    const {
      asset: { symbol },
    } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <TouchableOpacity
        onPress={() => this.goToBrowserUrl(AppConstants.URLS.TOKEN_BALANCE)}
      >
        <Text style={styles.warning}>
          {strings('asset_overview.were_unable')} {symbol}{' '}
          {strings('asset_overview.balance')}{' '}
          <Text style={styles.warningLinks}>
            {strings('asset_overview.troubleshooting_missing')}
          </Text>{' '}
          {strings('asset_overview.for_help')}
        </Text>
      </TouchableOpacity>
    );
  };

  onScanSuccess = (data, content) => {
    const { navigation } = this.props;
    if (data.private_key) {
      Alert.alert(
        strings('wallet.private_key_detected'),
        strings('wallet.do_you_want_to_import_this_account'),
        [
          {
            text: strings('wallet.cancel'),
            onPress: () => false,
            style: 'cancel',
          },
          {
            text: strings('wallet.yes'),
            onPress: async () => {
              try {
                await importAccountFromPrivateKey(data.private_key);
                navigation.navigate('ImportPrivateKeyView', {
                  screen: 'ImportPrivateKeySuccess',
                });
              } catch (e) {
                Alert.alert(
                  strings('import_private_key.error_title'),
                  strings('import_private_key.error_message'),
                );
              }
            },
          },
        ],
        { cancelable: false },
      );
    } else if (data.seed) {
      Alert.alert(
        strings('wallet.error'),
        strings('wallet.logout_to_import_seed'),
      );
    } else {
      setTimeout(() => {
        DeeplinkManager.parse(content, {
          origin: AppConstants.DEEPLINKS.ORIGIN_QR_CODE,
        });
      }, 500);
    }
  };

  openQRScanner = () => {
    const { navigation } = this.props;
    navigation.navigate('QRScanner', {
      onScanSuccess: this.onScanSuccess,
    });
  };

  render() {
    const {
      accounts,
      asset: {
        address,
        isETH = undefined,
        decimals,
        symbol,
        balanceError = null,
      },
      primaryCurrency,
      selectedAddress,
      tokenExchangeRates,
      tokenBalances,
      conversionRate,
      currentCurrency,
      chainId,
      // swapsIsLive,
      // swapsTokens,
    } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    let mainBalance, secondaryBalance;
    const itemAddress = safeToChecksumAddress(address);
    let balance, balanceFiat;
    if (isETH) {
      balance = renderFromWei(
        accounts[selectedAddress] && accounts[selectedAddress].balance,
      );
      balanceFiat = weiToFiat(
        hexToBN(accounts[selectedAddress].balance),
        conversionRate,
        currentCurrency,
      );
    } else {
      const exchangeRate =
        itemAddress in tokenExchangeRates
          ? tokenExchangeRates[itemAddress]
          : undefined;
      balance =
        itemAddress in tokenBalances
          ? renderFromTokenMinimalUnit(tokenBalances[itemAddress], decimals)
          : 0;
      balanceFiat = balanceToFiat(
        balance,
        conversionRate,
        exchangeRate,
        currentCurrency,
      );
    }
    // choose balances depending on 'primaryCurrency'
    if (primaryCurrency === 'ETH') {
      mainBalance = `${balance} ${symbol}`;
      secondaryBalance = balanceFiat;
    } else {
      mainBalance = !balanceFiat ? `${balance} ${symbol}` : balanceFiat;
      secondaryBalance = !balanceFiat ? balanceFiat : `${balance} ${symbol}`;
    }
    return (
      <View style={styles.wrapper} testID={'token-asset-overview'}>
        <View style={styles.assetLogo}>{this.renderLogo()}</View>
        <View style={styles.balance}>
          {balanceError ? (
            this.renderWarning()
          ) : (
            <>
              <Text
                style={
                  isTestNet(chainId) ? styles.testNetAmount : styles.amount
                }
                testID={'token-amount'}
              >
                {mainBalance}
              </Text>
              {secondaryBalance && (
                <Text style={styles.amountFiat}>{secondaryBalance}</Text>
              )}
            </>
          )}
        </View>

        {!balanceError && (
          <View style={styles.actions}>
            {/* {isETH && allowedToBuy(chainId) && (
              <AssetActionButton
                icon="buy"
                onPress={this.onBuy}
                label={strings('asset_overview.buy_button')}
              />
            )} */}
            <AssetActionButton
              testID={'token-send-button'}
              icon="send"
              onPress={this.onSend}
              label={strings('asset_overview.send_button')}
            />
            <AssetActionButton
              icon="receive"
              onPress={this.onReceive}
              label={strings('asset_overview.receive_button')}
            />
            <AssetActionButton
              testID={'token-send-button'}
              icon={
                <View style={styles.btnScan}>
                  <AntIcon
                    name="scan1"
                    size={20}
                    color={colors.primary.inverse}
                  />
                </View>
              }
              onPress={this.openQRScanner}
              label={'Scan'}
            />
            {/* {AppConstants.SWAPS.ACTIVE && (
              <AssetSwapButton
                isFeatureLive={swapsIsLive}
                isNetworkAllowed={isSwapsAllowed(chainId)}
                isAssetAllowed={isETH || address?.toLowerCase() in swapsTokens}
                onPress={this.goToSwaps}
              />
            )} */}
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  conversionRate:
    state.engine.backgroundState.CurrencyRateController.conversionRate,
  currentCurrency:
    state.engine.backgroundState.CurrencyRateController.currentCurrency,
  primaryCurrency: state.settings.primaryCurrency,
  selectedAddress:
    state.engine.backgroundState.PreferencesController.selectedAddress,
  tokenBalances:
    state.engine.backgroundState.TokenBalancesController.contractBalances,
  tokenExchangeRates:
    state.engine.backgroundState.TokenRatesController.contractExchangeRates,
  chainId: state.engine.backgroundState.NetworkController.provider.chainId,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  swapsIsLive: swapsLivenessSelector(state),
  swapsTokens: swapsTokensObjectSelector(state),
  tokenList: getTokenList(state),
});

const mapDispatchToProps = (dispatch) => ({
  toggleReceiveModal: (asset) => dispatch(toggleReceiveModal(asset)),
  newAssetTransaction: (selectedAsset) =>
    dispatch(newAssetTransaction(selectedAsset)),
});

AssetOverview.contextType = ThemeContext;

export default connect(mapStateToProps, mapDispatchToProps)(AssetOverview);
