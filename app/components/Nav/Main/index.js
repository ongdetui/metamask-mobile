import React, { useCallback, useEffect, useRef, useState } from 'react';

import { util } from '@metamask/controllers';
import NetInfo from '@react-native-community/netinfo';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  AppState,
  Linking,
  PushNotificationIOS,
  StyleSheet,
  View,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from 'react-native-push-notification';
import { connect } from 'react-redux';
import I18n, { strings } from '../../../../locales/i18n';
import {
  hideCurrentNotification,
  removeNotificationById,
  removeNotVisibleNotifications,
  showSimpleNotification,
  showTransactionNotification,
} from '../../../actions/notification';
import AppConstants from '../../../core/AppConstants';
import Engine from '../../../core/Engine';
import LockManager from '../../../core/LockManager';
import Device from '../../../util/device';
import BackupAlert from '../../UI/BackupAlert';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import FiatOrders from '../../UI/FiatOrders';
import GlobalAlert from '../../UI/GlobalAlert';
import Notification from '../../UI/Notification';
import ProtectYourWalletModal from '../../UI/ProtectYourWalletModal';
import SkipAccountSecurityModal from '../../UI/SkipAccountSecurityModal';
import SwapsLiveness from '../../UI/Swaps/SwapsLiveness';
import MainNavigator from './MainNavigator';

import {
  setInfuraAvailabilityBlocked,
  setInfuraAvailabilityNotBlocked,
} from '../../../actions/infuraAvailability';

import { createStackNavigator } from '@react-navigation/stack';
import WarningAlert from '../../../components/UI/WarningAlert';
import { KOVAN, RINKEBY, ROPSTEN } from '../../../constants/network';
import { MM_DEPRECATED_NETWORKS } from '../../../constants/urls';
import { colors as importedColors } from '../../../styles/common';
import { useTheme } from '../../../util/theme';
import { useMinimumVersions } from '../../hooks/MinimumVersions';
import usePrevious from '../../hooks/usePrevious';
import ReviewModal from '../../UI/ReviewModal';
import RootRPCMethodsUI from './RootRPCMethodsUI';

const Stack = createStackNavigator();

const createStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    loader: {
      backgroundColor: colors.background.default,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

const Main = (props) => {
  const [connected, setConnected] = useState(true);
  const [forceReload, setForceReload] = useState(false);
  const [showRemindLaterModal, setShowRemindLaterModal] = useState(false);
  const [skipCheckbox, setSkipCheckbox] = useState(false);
  const [showDeprecatedAlert, setShowDeprecatedAlert] = useState(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const backgroundMode = useRef(false);
  const locale = useRef(I18n.locale);
  const lockManager = useRef();
  const removeConnectionStatusListener = useRef();

  const removeNotVisibleNotifications = props.removeNotVisibleNotifications;

  const prevLockTime = usePrevious(props.lockTime);

  // useEnableAutomaticSecurityChecks();
  useMinimumVersions();

  const pollForIncomingTransactions = useCallback(async () => {
    props.thirdPartyApiMode && (await Engine.refreshTransactionHistory());
    // Stop polling if the app is in the background
    if (!backgroundMode.current) {
      setTimeout(() => {
        pollForIncomingTransactions();
      }, AppConstants.TX_CHECK_NORMAL_FREQUENCY);
    }
  }, [backgroundMode, props.thirdPartyApiMode]);

  const connectionChangeHandler = useCallback(
    (state) => {
      if (!state) return;
      const { isConnected } = state;
      // Show the modal once the status changes to offline
      if (connected && isConnected === false) {
        // props.navigation.navigate('OfflineModeView');
      }
      if (connected !== isConnected && isConnected !== null) {
        setConnected(isConnected);
      }
    },
    [connected, setConnected, props.navigation],
  );

  const checkInfuraAvailability = useCallback(async () => {
    if (props.providerType !== 'rpc') {
      try {
        const { TransactionController } = Engine.context;
        await util.query(TransactionController.ethQuery, 'blockNumber', []);
        props.setInfuraAvailabilityNotBlocked();
      } catch (e) {
        if (e.message === AppConstants.ERRORS.INFURA_BLOCKED_MESSAGE) {
          // props.navigation.navigate('OfflineModeView');
          props.setInfuraAvailabilityBlocked();
        }
      }
    } else {
      props.setInfuraAvailabilityNotBlocked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.navigation,
    props.providerType,
    props.setInfuraAvailabilityBlocked,
    props.setInfuraAvailabilityNotBlocked,
  ]);

  const handleAppStateChange = useCallback(
    (appState) => {
      const newModeIsBackground = appState === 'background';
      // If it was in background and it's not anymore
      // we need to stop the Background timer
      if (backgroundMode.current && !newModeIsBackground) {
        BackgroundTimer.stop();
        pollForIncomingTransactions();
      }

      backgroundMode.current = newModeIsBackground;

      // If the app is now in background, we need to start
      // the background timer, which is less intense
      if (backgroundMode.current) {
        removeNotVisibleNotifications();
        BackgroundTimer.runBackgroundTimer(async () => {
          await Engine.refreshTransactionHistory();
        }, AppConstants.TX_CHECK_BACKGROUND_FREQUENCY);
      }
    },
    [
      backgroundMode,
      removeNotVisibleNotifications,
      pollForIncomingTransactions,
    ],
  );

  const initForceReload = () => {
    // Force unmount the webview to avoid caching problems
    setForceReload(true);
    setTimeout(() => {
      setForceReload(false);
    }, 1000);
  };

  const renderLoader = () => (
    <View style={styles.loader}>
      <ActivityIndicator size="small" />
    </View>
  );

  const toggleRemindLater = () => {
    setShowRemindLaterModal(!showRemindLaterModal);
  };

  const toggleSkipCheckbox = () => {
    setSkipCheckbox(!skipCheckbox);
  };

  const skipAccountModalSecureNow = () => {
    toggleRemindLater();
    props.navigation.navigate('SetPasswordFlow', {
      screen: 'AccountBackupStep1B',
      params: { ...props.route.params },
    });
  };

  const skipAccountModalSkip = () => {
    if (skipCheckbox) toggleRemindLater();
  };

  useEffect(() => {
    if (locale.current !== I18n.locale) {
      locale.current = I18n.locale;
      initForceReload();
      return;
    }
    if (prevLockTime !== props.lockTime) {
      lockManager.current && lockManager.current.updateLockTime(props.lockTime);
    }
  });

  // Remove all notifications that aren't visible
  useEffect(() => {
    removeNotVisibleNotifications();
  }, [removeNotVisibleNotifications]);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    lockManager.current = new LockManager(props.navigation, props.lockTime);
    PushNotification.configure({
      requestPermissions: false,
      onNotification: (notification) => {
        let data = null;
        if (Device.isAndroid()) {
          if (notification.tag) {
            data = JSON.parse(notification.tag);
          }
        } else if (notification.data) {
          data = notification.data;
        }
        if (data && data.action === 'tx') {
          if (data.id) {
            // NotificationManager.setTransactionToView(data.id);
          }
          props.navigation.navigate('TransactionsHome');
        }

        if (Device.isIos()) {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
    });

    setTimeout(() => {
      // NotificationManager.init({
      //   navigation: props.navigation,
      //   showTransactionNotification: props.showTransactionNotification,
      //   hideCurrentNotification: props.hideCurrentNotification,
      //   showSimpleNotification: props.showSimpleNotification,
      //   removeNotificationById: props.removeNotificationById,
      // });
      pollForIncomingTransactions();
      checkInfuraAvailability();
      removeConnectionStatusListener.current = NetInfo.addEventListener(
        connectionChangeHandler,
      );
    }, 1000);

    return function cleanup() {
      AppState.removeEventListener('change', handleAppStateChange);
      lockManager.current.stopListening();
      removeConnectionStatusListener.current &&
        removeConnectionStatusListener.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDeprecatedNetworksArticle = () => {
    Linking.openURL(MM_DEPRECATED_NETWORKS);
  };

  const renderDeprecatedNetworkAlert = (network, backUpSeedphraseVisible) => {
    const { type } = network.provider;
    if (
      (type === ROPSTEN || type === RINKEBY || type === KOVAN) &&
      showDeprecatedAlert
    ) {
      return (
        <WarningAlert
          text={strings('networks.deprecated_network_msg')}
          dismissAlert={() => setShowDeprecatedAlert(false)}
          onPressLearnMore={openDeprecatedNetworksArticle}
          precedentAlert={backUpSeedphraseVisible}
        />
      );
    }
  };

  return (
    <React.Fragment>
      <View style={styles.flex}>
        {!forceReload ? (
          <MainNavigator navigation={props.navigation} />
        ) : (
          renderLoader()
        )}
        <GlobalAlert />
        <FadeOutOverlay />
        <Notification navigation={props.navigation} />
        <FiatOrders />
        <SwapsLiveness />
        <BackupAlert
          onDismiss={toggleRemindLater}
          navigation={props.navigation}
        />
        {renderDeprecatedNetworkAlert(
          props.network,
          props.backUpSeedphraseVisible,
        )}
        <SkipAccountSecurityModal
          modalVisible={showRemindLaterModal}
          onCancel={skipAccountModalSecureNow}
          onConfirm={skipAccountModalSkip}
          skipCheckbox={skipCheckbox}
          toggleSkipCheckbox={toggleSkipCheckbox}
        />
        <ProtectYourWalletModal navigation={props.navigation} />
        <RootRPCMethodsUI navigation={props.navigation} />
      </View>
    </React.Fragment>
  );
};

Main.router = MainNavigator.router;

Main.propTypes = {
  /**
   * Object that represents the navigator
   */
  navigation: PropTypes.object,
  /**
   * Time to auto-lock the app after it goes in background mode
   */
  lockTime: PropTypes.number,
  /**
   * Dispatch showing a transaction notification
   */
  // showTransactionNotification: PropTypes.func,
  /**
   * Dispatch showing a simple notification
   */
  // showSimpleNotification: PropTypes.func,
  /**
   * Dispatch hiding a transaction notification
   */
  // hideCurrentNotification: PropTypes.func,
  // removeNotificationById: PropTypes.func,
  /**
   * Indicates whether third party API mode is enabled
   */
  thirdPartyApiMode: PropTypes.bool,
  /**
   * Network provider type
   */
  providerType: PropTypes.string,
  /**
   * Dispatch infura availability blocked
   */
  setInfuraAvailabilityBlocked: PropTypes.func,
  /**
   * Dispatch infura availability not blocked
   */
  setInfuraAvailabilityNotBlocked: PropTypes.func,
  /**
   * Remove not visible notifications from state
   */
  removeNotVisibleNotifications: PropTypes.func,
  /**
   * Object that represents the current route info like params passed to it
   */
  route: PropTypes.object,
  /**
   * Object representing the selected network
   */
  network: PropTypes.object,
  /**
   * redux flag that indicates if the alert should be shown
   */
  backUpSeedphraseVisible: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  lockTime: state.settings.lockTime,
  thirdPartyApiMode: state.privacy.thirdPartyApiMode,
  providerType: state.engine.backgroundState.NetworkController.provider.type,
  network: state.engine.backgroundState.NetworkController,
  backUpSeedphraseVisible: state.user.backUpSeedphraseVisible,
});

const mapDispatchToProps = (dispatch) => ({
  showTransactionNotification: (args) =>
    dispatch(showTransactionNotification(args)),
  showSimpleNotification: (args) => dispatch(showSimpleNotification(args)),
  hideCurrentNotification: () => dispatch(hideCurrentNotification()),
  removeNotificationById: (id) => dispatch(removeNotificationById(id)),
  setInfuraAvailabilityBlocked: () => dispatch(setInfuraAvailabilityBlocked()),
  setInfuraAvailabilityNotBlocked: () =>
    dispatch(setInfuraAvailabilityNotBlocked()),
  removeNotVisibleNotifications: () =>
    dispatch(removeNotVisibleNotifications()),
});

const ConnectedMain = connect(mapStateToProps, mapDispatchToProps)(Main);

const MainFlow = () => (
  <Stack.Navigator
    initialRouteName={'Main'}
    mode={'modal'}
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: importedColors.transparent },
    }}
  >
    <Stack.Screen name={'Main'} component={ConnectedMain} />
    <Stack.Screen
      name={'ReviewModal'}
      component={ReviewModal}
      options={{ animationEnabled: false }}
    />
  </Stack.Navigator>
);

export default MainFlow;
