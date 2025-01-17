import { swapsUtils } from '@metamask/swaps-controller';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  Alert,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import Analytics from '../../../core/Analytics/Analytics';
import AppConstants from '../../../core/AppConstants';
import Engine from '../../../core/Engine';
import AnalyticsV2 from '../../../util/analyticsV2';

import { showAlert } from '../../../actions/alert';
import {
  toggleAccountsModal,
  toggleReceiveModal,
} from '../../../actions/modals';
import { newAssetTransaction } from '../../../actions/transaction';
import { protectWalletModalVisible } from '../../../actions/user';
import { swapsLivenessSelector } from '../../../reducers/swaps';

import {
  importAccountFromPrivateKey,
  isQRHardwareAccount,
  renderAccountName,
  renderShortAddress,
} from '../../../util/address';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import Device from '../../../util/device';
import {
  doENSReverseLookup,
  isDefaultAccountName,
} from '../../../util/ENSUtils';
import { renderFiat, renderFromWei } from '../../../util/number';
import { getEther, getTicker } from '../../../util/transactions';

import { ReceivedIcon, ScanIcon, SendIcon } from 'images/icon';
import Routes from '../../../constants/navigation/Routes';
import ClipboardManager from '../../../core/ClipboardManager';
import DeeplinkManager from '../../../core/DeeplinkManager';
import { baseStyles, fontStyles } from '../../../styles/common';
import { mockTheme, ThemeContext } from '../../../util/theme';

const trackEvent = (event) => {
  InteractionManager.runAfterInteractions(() => {
    Analytics.trackEvent(event);
  });
};

const createStyles = (colors) =>
  StyleSheet.create({
    scrollView: {
      backgroundColor: colors.background.default,
      marginTop: 10,
    },
    wrapper: {
      paddingHorizontal: 20,
      paddingBottom: 0,
      alignItems: 'center',
    },
    info: {
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    data: {
      textAlign: 'center',
      // borderRadius: 50,
    },
    label: {
      fontSize: 24,
      textAlign: 'center',
      ...fontStyles.normal,
      color: colors.text.default,
    },
    labelInput: {
      marginBottom: Device.isAndroid() ? -10 : 0,
    },
    labelWrapper: {
      flexDirection: 'row',
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      padding: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.text.default,
      height: 28,
      borderRadius: 14,
    },
    tagText: {
      fontSize: 12,
      ...fontStyles.bold,
      minWidth: 32,
      textAlign: 'center',
      color: colors.text.default,
    },
    addressWrapper: {
      backgroundColor: colors.primary.muted,
      borderRadius: 40,
      marginTop: 20,
      marginBottom: 20,
      paddingVertical: 7,
      paddingHorizontal: 15,
    },
    address: {
      fontSize: 12,
      color: colors.text.default,
      ...fontStyles.normal,
      letterSpacing: 0.8,
    },
    amountFiat: {
      fontSize: 14,
      paddingTop: 5,
      color: colors.text.alternative,
      ...fontStyles.normal,
      marginBottom: 25,
    },
    identiconBorder: {
      borderRadius: 80,
      borderWidth: 2,
      padding: 2,
      borderColor: colors.primary.default,
    },
    onboardingWizardLabel: {
      borderWidth: 2,
      borderRadius: 4,
      paddingVertical: Device.isIos() ? 2 : -4,
      paddingHorizontal: Device.isIos() ? 5 : 5,
      top: Device.isIos() ? 0 : -2,
    },
    actions: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexDirection: 'row',
    },

    btnScan: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    textBalance: {
      fontSize: 26,
      ...fontStyles.normal,
      marginTop: 8,
    },

    action: {
      marginHorizontal: 15,
      alignItems: 'center',
    },

    btnAction: {
      backgroundColor: `#024868`,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },

    textAction: {
      color: `#3A3A3A`,
      fontSize: 16,
      ...fontStyles.normal,
      marginTop: 8,
    },

    textAddress: {
      fontSize: 14,
      ...fontStyles.normal,
      textAlign: 'center',
      color: `#555555`,
    },

    btnAddress: {
      backgroundColor: `#D1E1FA`,
      paddingHorizontal: 12,
      borderRadius: 40,
      paddingVertical: 5,
      marginBottom: 15,
    },
  });

/**
 * View that's part of the <Wallet /> component
 * which shows information about the selected account
 */
class AccountOverview extends PureComponent {
  static propTypes = {
    /**
     * String that represents the selected address
     */
    selectedAddress: PropTypes.string,
    /**
    /* Identities object required to get account name
    */
    identities: PropTypes.object,
    /**
     * Object that represents the selected account
     */
    account: PropTypes.object,
    /**
    /* Selected currency
    */
    currentCurrency: PropTypes.string,
    /**
    /* Triggers global alert
    */
    showAlert: PropTypes.func,
    /**
     * Action that toggles the accounts modal
     */
    toggleAccountsModal: PropTypes.func,
    /**
     * whether component is being rendered from onboarding wizard
     */
    onboardingWizard: PropTypes.bool,
    /**
     * Used to get child ref
     */
    onRef: PropTypes.func,
    /**
     * Prompts protect wallet modal
     */
    protectWalletModalVisible: PropTypes.func,
    /**
     * Start transaction with asset
     */
    newAssetTransaction: PropTypes.func,
    /**
    /* navigation object required to access the props
    /* passed by the parent component
    */
    navigation: PropTypes.object,
    /**
     * Action that toggles the receive modal
     */
    toggleReceiveModal: PropTypes.func,
    /**
     * Chain id
     */
    chainId: PropTypes.string,
    /**
     * Wether Swaps feature is live or not
     */
    swapsIsLive: PropTypes.bool,
    /**
     * ID of the current network
     */
    network: PropTypes.string,
    /**
     * Current provider ticker
     */
    ticker: PropTypes.string,
  };

  state = {
    accountLabelEditable: false,
    accountLabel: '',
    originalAccountLabel: '',
    ens: undefined,
  };

  editableLabelRef = React.createRef();
  scrollViewContainer = React.createRef();
  mainView = React.createRef();

  animatingAccountsModal = false;

  toggleAccountsModal = () => {
    const { onboardingWizard } = this.props;
    if (!onboardingWizard && !this.animatingAccountsModal) {
      this.animatingAccountsModal = true;
      this.props.toggleAccountsModal();
      setTimeout(() => {
        this.animatingAccountsModal = false;
      }, 500);
    }
  };

  isAccountLabelDefined = (accountLabel) =>
    !!accountLabel && !!accountLabel.trim().length;

  input = React.createRef();

  componentDidMount = () => {
    const { identities, selectedAddress, onRef } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabel });
    onRef && onRef(this);
    InteractionManager.runAfterInteractions(() => {
      this.doENSLookup();
    });

    const { PreferencesController } = Engine.context;
    if (!this.isAccountLabelDefined(accountLabel)) {
      PreferencesController.setAccountLabel(selectedAddress, 'Account');
    }
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.account.address !== this.props.account.address ||
      prevProps.network !== this.props.network
    ) {
      requestAnimationFrame(() => {
        this.doENSLookup();
      });
    }
  }

  setAccountLabel = () => {
    const { PreferencesController } = Engine.context;
    const { selectedAddress } = this.props;
    const { accountLabel } = this.state;

    const lastAccountLabel =
      PreferencesController.state.identities[selectedAddress].name;

    PreferencesController.setAccountLabel(
      selectedAddress,
      this.isAccountLabelDefined(accountLabel)
        ? accountLabel
        : lastAccountLabel,
    );
    this.setState({ accountLabelEditable: false });
  };

  onAccountLabelChange = (accountLabel) => {
    this.setState({ accountLabel });
  };

  setAccountLabelEditable = () => {
    const { identities, selectedAddress } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabelEditable: true, accountLabel });
    setTimeout(() => {
      this.input && this.input.current && this.input.current.focus();
    }, 100);
  };

  cancelAccountLabelEdition = () => {
    const { identities, selectedAddress } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabelEditable: false, accountLabel });
  };

  copyAccountToClipboard = async () => {
    const { selectedAddress } = this.props;
    await ClipboardManager.setString(selectedAddress);
    this.props.showAlert({
      isVisible: true,
      autodismiss: 1500,
      content: 'clipboard-alert',
      data: { msg: strings('account_details.account_copied_to_clipboard') },
    });
    // setTimeout(() => this.props.protectWalletModalVisible(), 2000);
    // InteractionManager.runAfterInteractions(() => {
    //   Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COPIED_ADDRESS);
    // });
  };

  onReceive = () => this.props.toggleReceiveModal();

  onSend = () => {
    const { newAssetTransaction, navigation, ticker } = this.props;
    newAssetTransaction(getEther(ticker));
    navigation.navigate('SendFlowView');
  };

  onBuy = () => {
    this.props.navigation.navigate(Routes.FIAT_ON_RAMP_AGGREGATOR.ID);
    InteractionManager.runAfterInteractions(() => {
      Analytics.trackEventWithParameters(
        AnalyticsV2.ANALYTICS_EVENTS.BUY_BUTTON_CLICKED,
        {
          text: 'Buy',
          location: 'Wallet',
          chain_id_destination: this.props.chainId,
        },
      );
    });
  };

  goToSwaps = () =>
    this.props.navigation.navigate('Swaps', {
      screen: 'SwapsAmountView',
      params: {
        sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS,
      },
    });

  doENSLookup = async () => {
    const { network, account } = this.props;
    try {
      const ens = await doENSReverseLookup(account.address, network);
      this.setState({ ens });
      // eslint-disable-next-line no-empty
    } catch {}
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
    trackEvent(ANALYTICS_EVENT_OPTS.WALLET_QR_SCANNER);
  };

  copyAddress = () => {
    ClipboardManager.setString(this.props.account.address);
  };

  render() {
    const {
      account: { address, name, balance },
      currentCurrency,
      onboardingWizard,
      chainId,
      swapsIsLive,
    } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const themeAppearance = this.context.themeAppearance || 'light';
    const styles = createStyles(colors);

    const accountBalance = `${renderFromWei(balance)} ${getTicker(
      this.props.ticker,
    )}`;

    const fiatBalance = `${renderFiat(
      Engine.getTotalFiatAccountBalance(),
      currentCurrency,
    )}`;

    if (!address) return null;
    const { accountLabelEditable, accountLabel, ens } = this.state;

    const isQRHardwareWalletAccount = isQRHardwareAccount(address);

    return (
      <View
        style={baseStyles.flexGrow}
        ref={this.scrollViewContainer}
        collapsable={false}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps={'never'}
          style={styles.scrollView}
          contentContainerStyle={styles.wrapper}
          testID={'account-overview'}
        >
          <View style={styles.info} ref={this.mainView}>
            {/* <TouchableOpacity
              style={styles.identiconBorder}
              disabled={onboardingWizard}
              onPress={this.toggleAccountsModal}
              testID={'wallet-account-identicon'}
            >
              <Identicon
                address={address}
                diameter={38} 
                noFadeIn={onboardingWizard}
              />
            </TouchableOpacity> */}

            <View
              ref={this.editableLabelRef}
              style={styles.data}
              collapsable={false}
            >
              {accountLabelEditable ? (
                <TextInput
                  style={[
                    styles.label,
                    styles.labelInput,
                    styles.onboardingWizardLabel,
                    onboardingWizard
                      ? { borderColor: colors.primary.default }
                      : { borderColor: colors.background.default },
                  ]}
                  editable={accountLabelEditable}
                  onChangeText={this.onAccountLabelChange}
                  onSubmitEditing={this.setAccountLabel}
                  onBlur={this.setAccountLabel}
                  testID={'account-label-text-input'}
                  value={accountLabel}
                  selectTextOnFocus
                  ref={this.input}
                  returnKeyType={'done'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  numberOfLines={1}
                  placeholderTextColor={colors.text.muted}
                  keyboardAppearance={themeAppearance}
                />
              ) : (
                <View style={styles.labelWrapper}>
                  <TouchableOpacity onLongPress={this.setAccountLabelEditable}>
                    <Text
                      style={[
                        styles.label,
                        styles.onboardingWizardLabel,
                        {
                          borderColor: onboardingWizard
                            ? colors.primary.default
                            : colors.background.default,
                        },
                      ]}
                      numberOfLines={1}
                      testID={'edit-account-label'}
                    >
                      {isDefaultAccountName(name) && ens ? ens : name}
                    </Text>
                  </TouchableOpacity>
                  {isQRHardwareWalletAccount && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {strings('transaction.hardware')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={this.copyAccountToClipboard}
              style={styles.btnAddress}
              activeOpacity={0.5}
            >
              <Text style={styles.textAddress}>
                {renderShortAddress(address, 4)}
              </Text>
            </TouchableOpacity>
            <Text style={styles.textBalance}>{accountBalance}</Text>

            <Text style={styles.amountFiat}>{fiatBalance}</Text>

            {/* <TouchableOpacity
              style={styles.addressWrapper}
              onPress={this.copyAccountToClipboard}
            >
              <EthereumAddress
                address={address}
                style={styles.address}
                type={'short'}
              />
            </TouchableOpacity> */}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.action}
                onPress={this.onSend}
                activeOpacity={0.5}
              >
                <View style={styles.btnAction}>
                  <SendIcon />
                </View>
                <Text style={styles.textAction}>
                  {strings('asset_overview.send_button')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.action}
                onPress={this.onReceive}
                activeOpacity={0.5}
              >
                <View style={styles.btnAction}>
                  <ReceivedIcon />
                </View>
                <Text style={styles.textAction}>
                  {strings('asset_overview.receive_button')}
                </Text>
              </TouchableOpacity>
              {/* {allowedToBuy(chainId) && (
                <AssetActionButton
                  icon="buy"
                  onPress={this.onBuy}
                  label={strings('asset_overview.buy_button')}
                />
              )} */}
              <TouchableOpacity
                style={styles.action}
                onPress={this.openQRScanner}
                activeOpacity={0.5}
              >
                <View style={styles.btnAction}>
                  <ScanIcon />
                </View>
                <Text style={styles.textAction}>Scan</Text>
              </TouchableOpacity>

              {/* {AppConstants.SWAPS.ACTIVE && false && (
                <AssetSwapButton
                  isFeatureLive={swapsIsLive}
                  isNetworkAllowed={isSwapsAllowed(chainId)}
                  onPress={this.goToSwaps}
                  isAssetAllowed
                />
              )} */}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedAddress:
    state.engine.backgroundState.PreferencesController.selectedAddress,
  identities: state.engine.backgroundState.PreferencesController.identities,
  currentCurrency:
    state.engine.backgroundState.CurrencyRateController.currentCurrency,
  chainId: state.engine.backgroundState.NetworkController.provider.chainId,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  network: state.engine.backgroundState.NetworkController.network,
  swapsIsLive: swapsLivenessSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  showAlert: (config) => dispatch(showAlert(config)),
  toggleAccountsModal: () => dispatch(toggleAccountsModal()),
  protectWalletModalVisible: () => dispatch(protectWalletModalVisible()),
  newAssetTransaction: (selectedAsset) =>
    dispatch(newAssetTransaction(selectedAsset)),
  toggleReceiveModal: (asset) => dispatch(toggleReceiveModal(asset)),
});

AccountOverview.contextType = ThemeContext;

export default connect(mapStateToProps, mapDispatchToProps)(AccountOverview);
