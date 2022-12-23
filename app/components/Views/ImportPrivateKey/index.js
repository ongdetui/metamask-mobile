import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Feather';
import IconQr from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { connect } from 'react-redux';
import zxcvbn from 'zxcvbn';
import { strings } from '../../../../locales/i18n';
import generateTestId from '../../../../wdio/utils/generateTestId';
import { setLockTime } from '../../../actions/settings';
import {
  logIn,
  passwordSet,
  seedphraseNotBackedUp,
} from '../../../actions/user';
import { LoginOptionsSwitch } from '../../../components/UI/LoginOptionsSwitch';
import {
  BIOMETRY_CHOICE_DISABLED,
  EXISTING_USER,
  NEXT_MAKER_REMINDER,
  SEED_PHRASE_HINTS,
  TRUE,
} from '../../../constants/storage';
import {
  CONFIRM_PASSWORD_INPUT_BOX_ID,
  CREATE_PASSWORD_INPUT_BOX_ID,
} from '../../../constants/test-ids';
import AppConstants from '../../../core/AppConstants';
import Engine from '../../../core/Engine';
import PreventScreenshot from '../../../core/PreventScreenshot';
import SecureKeychain from '../../../core/SecureKeychain';
import { fontStyles } from '../../../styles/common';
import { importAccountFromPrivateKey } from '../../../util/address';
import AnalyticsV2 from '../../../util/analyticsV2';
import Device from '../../../util/device';
import Logger from '../../../util/Logger';
import { getPasswordStrengthWord } from '../../../util/password';
import { mockTheme, ThemeContext } from '../../../util/theme';
import StyledButton from '../../UI/StyledButton';

const createStyles = (colors) =>
  StyleSheet.create({
    mainWrapper: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    topOverlay: {
      flex: 1,
      backgroundColor: colors.primary.muted,
    },
    wrapper: {
      flexGrow: 1,
    },
    content: {
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 32,
      marginTop: 20,
      marginBottom: 40,
      color: colors.text.default,
      justifyContent: 'center',
      textAlign: 'left',
      ...fontStyles.normal,
    },
    dataRow: {
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
      color: colors.text.default,
      textAlign: 'left',
      ...fontStyles.normal,
    },
    subtitleText: {
      fontSize: 18,
      ...fontStyles.bold,
      color: colors.text.default,
    },
    scanPkeyRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginLeft: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border.default,
      alignSelf: 'center',
      padding: 8,
      borderRadius: 6,
    },
    scanPkeyText: {
      fontSize: 14,
      color: colors.primary.default,
    },
    icon: {
      textAlign: 'left',
      fontSize: 50,
      marginTop: 0,
      marginLeft: 0,
      color: colors.icon.alternative,
    },
    buttonWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: 20,
      backgroundColor: colors.background.default,
    },
    button: {
      marginBottom: Device.isIphoneX() ? 20 : 0,
    },
    top: {
      paddingTop: 0,
      padding: 30,
    },
    bottom: {
      width: '100%',
      padding: 30,
      backgroundColor: colors.background.default,
    },
    input: {
      fontSize: 15,
      ...fontStyles.normal,
      color: colors.text.default,
      flex: 1,
    },

    inputPrivateKey: {
      marginTop: 6,
      marginBottom: 10,
      backgroundColor: colors.background.default,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 15,
      borderRadius: 4,
      height: 120,
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border.default,
    },

    navbarRightButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 22,
      paddingTop: 20,
      paddingBottom: 10,
      marginTop: Device.isIphoneX() ? 40 : 20,
    },
    closeIcon: {
      fontSize: 28,
      color: colors.text.default,
    },

    hintLabel: {
      color: colors.text.default,
      fontSize: 16,
      marginBottom: 12,
      ...fontStyles.normal,
    },

    field: {
      marginVertical: 5,
      position: 'relative',
      marginHorizontal: 30,
    },

    showPassword: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    input2: {
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: 10,
      borderRadius: 6,
      fontSize: 14,
      height: 50,
      ...fontStyles.normal,
      color: colors.text.default,
    },

    passwordStrengthLabel: {
      height: 20,
      marginTop: 10,
      fontSize: 15,
      color: colors.text.default,
      ...fontStyles.normal,
    },

    showMatchingPasswords: {
      position: 'absolute',
      top: 52,
      right: 17,
      alignSelf: 'flex-end',
    },

    switch: {
      marginHorizontal: 30,
    },
  });

const IOS_DENY_BIOMETRIC_ERROR =
  'The user name or passphrase you entered is not correct.';

/**
 * View that's displayed the first time a user receives funds
 */
class ImportPrivateKey extends PureComponent {
  static propTypes = {
    /**
    /* navigation object required to push and pop other views
    */
    navigation: PropTypes.object,
    route: PropTypes.object,
    seedphraseNotBackedUp: PropTypes.func,
    passwordSet: PropTypes.func,
    logIn: PropTypes.func,
    passwordStrength: PropTypes.any,
    selectedAddress: PropTypes.string,
    setLockTime: PropTypes.func,
  };

  state = {
    privateKey: '',
    loading: false,
    inputWidth: Device.isAndroid() ? '99%' : undefined,
    create: this.props.route?.params?.create
      ? this.props.route.params.create
      : false,
    secureTextEntry: true,
    password: '',
    confirmPassword: '',
    biometryType: null,
    biometryChoice: false,
    rememberMe: false,
  };

  keyringControllerPasswordSet = false;

  componentDidMount = async () => {
    this.mounted = true;

    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (biometryType) {
      this.setState({
        biometryType: Device.isAndroid() ? 'biometrics' : biometryType,
        biometryChoice: true,
      });
    }
    // Workaround https://github.com/facebook/react-native/issues/9958
    this.state.inputWidth &&
      setTimeout(() => {
        this.mounted && this.setState({ inputWidth: '100%' });
      }, 100);
    InteractionManager.runAfterInteractions(() => PreventScreenshot.forbid());
  };

  componentWillUnmount = () => {
    this.mounted = false;
    InteractionManager.runAfterInteractions(() => PreventScreenshot.allow());
  };

  createNewVaultAndKeychain = async (password) => {
    const { KeyringController } = Engine.context;
    await Engine.resetState();
    await KeyringController.createNewVaultAndKeychain(password);
    this.keyringControllerPasswordSet = true;
  };

  updateBiometryChoice = async (biometryChoice) => {
    if (!biometryChoice) {
      await AsyncStorage.setItem(BIOMETRY_CHOICE_DISABLED, TRUE);
    } else {
      await AsyncStorage.removeItem(BIOMETRY_CHOICE_DISABLED);
    }
    this.setState({ biometryChoice });
  };

  handleRejectedOsBiometricPrompt = async (error) => {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (error.toString().includes(IOS_DENY_BIOMETRIC_ERROR) && !biometryType) {
      this.updateBiometryChoice();
      throw Error(strings('choose_password.disable_biometric_error'));
    }
  };

  getSeedPhrase = async () => {
    const { KeyringController } = Engine.context;
    const { password } = this.state;
    const keychainPassword = this.keyringControllerPasswordSet ? password : '';
    const mnemonic = await KeyringController.exportSeedPhrase(
      keychainPassword,
    ).toString();
    return JSON.stringify(mnemonic).replace(/"/g, '');
  };

  recreateVault = async (password) => {
    const { KeyringController, PreferencesController } = Engine.context;
    const seedPhrase = await this.getSeedPhrase();

    let importedAccounts = [];
    try {
      const keychainPassword = this.keyringControllerPasswordSet
        ? this.state.password
        : '';
      // Get imported accounts
      const simpleKeyrings = KeyringController.state.keyrings.filter(
        (keyring) => keyring.type === 'Simple Key Pair',
      );
      for (let i = 0; i < simpleKeyrings.length; i++) {
        const simpleKeyring = simpleKeyrings[i];
        const simpleKeyringAccounts = await Promise.all(
          simpleKeyring.accounts.map((account) =>
            KeyringController.exportAccount(keychainPassword, account),
          ),
        );
        importedAccounts = [...importedAccounts, ...simpleKeyringAccounts];
      }
    } catch (e) {
      Logger.error(
        e,
        'error while trying to get imported accounts on recreate vault',
      );
    }

    // Recreate keyring with password given to this method
    await KeyringController.createNewVaultAndRestore(password, seedPhrase);
    // Keyring is set with empty password or not
    this.keyringControllerPasswordSet = password !== '';

    // Get props to restore vault
    const hdKeyring = KeyringController.state.keyrings[0];
    const existingAccountCount = hdKeyring.accounts.length;
    const selectedAddress = this.props.selectedAddress;
    let preferencesControllerState = PreferencesController.state;

    // Create previous accounts again
    for (let i = 0; i < existingAccountCount - 1; i++) {
      await KeyringController.addNewAccount();
    }

    try {
      // Import imported accounts again
      for (let i = 0; i < importedAccounts.length; i++) {
        await KeyringController.importAccountWithStrategy('privateKey', [
          importedAccounts[i],
        ]);
      }
    } catch (e) {
      Logger.error(
        e,
        'error while trying to import accounts on recreate vault',
      );
    }

    // Reset preferencesControllerState
    preferencesControllerState = PreferencesController.state;

    // Set preferencesControllerState again
    await PreferencesController.update(preferencesControllerState);
    // Reselect previous selected account if still available
    if (hdKeyring.accounts.includes(selectedAddress)) {
      PreferencesController.setSelectedAddress(selectedAddress);
    } else {
      PreferencesController.setSelectedAddress(hdKeyring.accounts[0]);
    }
  };

  goNext = async () => {
    const { password, confirmPassword, create } = this.state;
    const passwordsMatch = password !== '' && password === confirmPassword;
    if (!passwordsMatch && create) {
      this.setState({ loading: false });
      return;
    }
    if (this.state.privateKey === '') {
      Alert.alert(
        strings('import_private_key.error_title'),
        strings('import_private_key.error_empty_message'),
      );
      this.setState({ loading: false });
      return;
    }

    this.setState({ loading: true });
    // Import private key

    try {
      if (create) {
        await this.createNewVaultAndKeychain(password);
        // await this.recreateVault(password);
        await AsyncStorage.removeItem(NEXT_MAKER_REMINDER);
        await AsyncStorage.setItem(EXISTING_USER, TRUE);
        await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
        this.props.seedphraseNotBackedUp();

        await SecureKeychain.resetGenericPassword();
        if (this.state.biometryType && this.state.biometryChoice) {
          try {
            await SecureKeychain.setGenericPassword(
              password,
              SecureKeychain.TYPES.BIOMETRICS,
            );
          } catch (error) {
            if (Device.isIos) await this.handleRejectedOsBiometricPrompt(error);
            // throw error;
          }
        } else if (this.state.rememberMe) {
          await SecureKeychain.setGenericPassword(
            password,
            SecureKeychain.TYPES.REMEMBER_ME,
          );
        } else {
          await SecureKeychain.resetGenericPassword();
        }

        await AsyncStorage.setItem(EXISTING_USER, TRUE);
        await AsyncStorage.removeItem(SEED_PHRASE_HINTS);

        this.props.passwordSet();
        this.props.logIn();
        this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
      }

      await importAccountFromPrivateKey(this.state.privateKey);
      create
        ? this.props.navigation.reset({ routes: [{ name: 'HomeNav' }] })
        : this.props.navigation.navigate('ImportPrivateKeySuccess');
      this.setState({ loading: false, privateKey: '' });
      InteractionManager.runAfterInteractions(() => {
        AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.WALLET_CREATED, {
          biometrics_enabled: Boolean(this.state.biometryType),
        });
        AnalyticsV2.trackEvent(
          AnalyticsV2.ANALYTICS_EVENTS.WALLET_SETUP_COMPLETED,
          {
            wallet_setup_type: 'new',
            new_wallet: true,
          },
        );
      });
    } catch (e) {
      Alert.alert(
        strings('import_private_key.error_title'),
        strings('import_private_key.error_message'),
      );
      this.setState({ loading: false });
    }
  };

  learnMore = () =>
    this.props.navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: 'https://metamask.zendesk.com/hc/en-us/articles/360015289932-What-are-imported-accounts-',
        title: strings('drawer.metamask_support'),
      },
    });

  onInputChange = (value) => {
    this.setState({ privateKey: value });
  };

  dismiss = () => {
    this.props.navigation.goBack(null);
  };

  scanPkey = () => {
    this.props.navigation.navigate('QRScanner', {
      onScanSuccess: (data) => {
        if (data.private_key) {
          this.setState({ privateKey: data.private_key }, () => {
            this.goNext();
          });
        } else {
          Alert.alert(
            strings('import_private_key.error_title'),
            strings('import_private_key.error_message'),
          );
        }
      },
    });
  };

  onPasswordChange = (val) => {
    const passInfo = zxcvbn(val);

    this.setState({ password: val, passwordStrength: passInfo.score });
  };

  toggleShowHide = () => {
    this.setState((state) => ({ secureTextEntry: !state.secureTextEntry }));
  };

  setConfirmPassword = (val) => this.setState({ confirmPassword: val });

  renderSwitch = () => {
    const { biometryType, biometryChoice } = this.state;
    const handleUpdateRememberMe = (rememberMe) => {
      this.setState({ rememberMe });
    };
    return (
      <LoginOptionsSwitch
        shouldRenderBiometricOption={biometryType}
        biometryChoiceState={biometryChoice}
        onUpdateBiometryChoice={this.updateBiometryChoice}
        onUpdateRememberMe={handleUpdateRememberMe}
      />
    );
  };

  render() {
    const {
      secureTextEntry,
      password,
      passwordStrength,
      inputWidth,
      confirmPassword,
      create,
    } = this.state;
    const colors = this.context.colors || mockTheme.colors;
    const themeAppearance = this.context.themeAppearance || 'light';
    const styles = createStyles(colors);
    const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
    const passwordsMatch = password !== '' && password === confirmPassword;

    return (
      <View style={styles.mainWrapper}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.wrapper}
          style={[
            styles.topOverlay,
            this.state.create && { backgroundColor: `#FFFFFF` },
          ]}
          testID={'first-incoming-transaction-screen'}
          resetScrollToCoords={{ x: 0, y: 0 }}
        >
          <>
            <TouchableOpacity
              onPress={this.dismiss}
              style={styles.navbarRightButton}
            >
              <MaterialIcon name="close" size={15} style={styles.closeIcon} />
            </TouchableOpacity>
            <View style={styles.top}>
              <Icon name="download" style={styles.icon} />
              <Text style={styles.title}>
                {/* {strings('import_private_key.title')} */}
                Import Private key
              </Text>
              <View style={styles.dataRow}>
                <Text style={styles.label}>
                  {strings('import_private_key.description_one')}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label} onPress={this.learnMore}>
                  {strings('import_private_key.learn_more_here')}
                </Text>
              </View>
            </View>
            <View style={styles.content} testID={'import-account-screen'}>
              <View style={styles.bottom}>
                <View style={styles.subtitleText}>
                  <Text style={styles.hintLabel}>
                    {strings('import_private_key.subtitle')}
                  </Text>
                </View>
                <View style={styles.inputPrivateKey}>
                  <TextInput
                    value={this.state.privateKey}
                    numberOfLines={3}
                    multiline
                    style={[
                      styles.input,
                      this.state.inputWidth
                        ? { width: this.state.inputWidth }
                        : {},
                    ]}
                    onChangeText={this.onInputChange}
                    testID={'input-private-key'}
                    blurOnSubmit
                    onSubmitEditing={this.goNext}
                    returnKeyType={'next'}
                    placeholder={strings('import_private_key.example')}
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize={'none'}
                    keyboardAppearance={themeAppearance}
                  />
                  <View style={styles.scanPkeyRow}>
                    <TouchableOpacity
                      onPress={this.scanPkey}
                      style={styles.scanPkey}
                    >
                      <IconQr
                        name="qrcode"
                        size={20}
                        color={colors.icon.default}
                      />
                      {/* <Text style={styles.scanPkeyText}>
                      {strings('import_private_key.or_scan_a_qr_code')}
                    </Text> */}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {create && (
              <View style={styles.field}>
                <Text style={styles.hintLabel}>
                  {strings('choose_password.password')}
                </Text>
                <Text
                  onPress={this.toggleShowHide}
                  style={[styles.hintLabel, styles.showPassword]}
                >
                  {strings(
                    `choose_password.${secureTextEntry ? 'show' : 'hide'}`,
                  )}
                </Text>
                <TextInput
                  style={[styles.input2, inputWidth]}
                  value={password}
                  onChangeText={this.onPasswordChange}
                  secureTextEntry={secureTextEntry}
                  placeholder=""
                  placeholderTextColor={colors.text.muted}
                  {...generateTestId(Platform, CREATE_PASSWORD_INPUT_BOX_ID)}
                  onSubmitEditing={this.jumpToConfirmPassword}
                  returnKeyType="next"
                  autoCapitalize="none"
                  keyboardAppearance={themeAppearance}
                />
                {(password !== '' && (
                  <Text style={styles.passwordStrengthLabel}>
                    {strings('choose_password.password_strength')}
                    <Text style={styles[`strength_${passwordStrengthWord}`]}>
                      {' '}
                      {strings(
                        `choose_password.strength_${passwordStrengthWord}`,
                      )}
                    </Text>
                  </Text>
                )) || <Text style={styles.passwordStrengthLabel} />}
              </View>
            )}
            {create && (
              <View
                style={StyleSheet.flatten([
                  styles.field,
                  { marginTop: 10, marginBottom: 30 },
                ])}
              >
                <Text style={styles.hintLabel}>
                  {strings('choose_password.confirm_password')}
                </Text>
                <TextInput
                  ref={this.confirmPasswordInput}
                  style={[styles.input2, inputWidth]}
                  value={confirmPassword}
                  onChangeText={this.setConfirmPassword}
                  secureTextEntry={secureTextEntry}
                  placeholder={''}
                  placeholderTextColor={colors.text.muted}
                  testID={CONFIRM_PASSWORD_INPUT_BOX_ID}
                  accessibilityLabel={CONFIRM_PASSWORD_INPUT_BOX_ID}
                  onSubmitEditing={this.onPressCreate}
                  returnKeyType={'done'}
                  autoCapitalize="none"
                  keyboardAppearance={themeAppearance}
                />
                <View style={styles.showMatchingPasswords}>
                  {passwordsMatch ? (
                    <Icon
                      name="check"
                      size={16}
                      color={colors.success.default}
                    />
                  ) : null}
                </View>
              </View>
            )}

            {create && <View style={styles.switch}>{this.renderSwitch()}</View>}
            <View style={styles.buttonWrapper}>
              <StyledButton
                containerStyle={styles.button}
                type={'confirm'}
                onPress={this.goNext}
                testID={'import-button'}
              >
                {this.state.loading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary.inverse}
                  />
                ) : (
                  strings('import_private_key.cta_text')
                )}
              </StyledButton>
            </View>
          </>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

ImportPrivateKey.contextType = ThemeContext;

const mapStateToProps = (state) => ({
  selectedAddress:
    state.engine.backgroundState.PreferencesController.selectedAddress,
});

const mapDispatchToProps = (dispatch) => ({
  passwordSet: () => dispatch(passwordSet()),
  seedphraseNotBackedUp: () => dispatch(seedphraseNotBackedUp()),
  logIn: () => dispatch(logIn()),
  setLockTime: (time) => dispatch(setLockTime(time)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportPrivateKey);
