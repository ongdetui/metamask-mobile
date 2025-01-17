import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { useSelector } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import generateTestId from '../../../../wdio/utils/generateTestId';
import Routes from '../../../constants/navigation/Routes';
import Analytics from '../../../core/Analytics/Analytics';
import Engine from '../../../core/Engine';
import { baseStyles, fontStyles } from '../../../styles/common';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import Logger from '../../../util/Logger';
import { hexToBN, renderFromWei, weiToFiat } from '../../../util/number';
import { shouldShowWhatsNewModal } from '../../../util/onboarding';
import { useTheme } from '../../../util/theme';
import { getTicker } from '../../../util/transactions';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import AccountOverview from '../../UI/AccountOverview';
import CollectibleContracts from '../../UI/CollectibleContracts';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import OnboardingWizard from '../../UI/OnboardingWizard';
import Tokens from '../../UI/Tokens';
import ErrorBoundary from '../ErrorBoundary';

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    tabUnderlineStyle: {
      backgroundColor: colors.primary.default,
      width: 154 / 2,
      borderRadius: 100,
      height: 44,
      bottom: 2,
      marginLeft: 2,
      zIndex: 0,
    },
    tabStyle: {
      paddingBottom: 0,
    },
    tabBar: {
      width: 168,
      backgroundColor: `#FFFFFF`,
      borderWidth: 1,
      borderRadius: 100,
      borderColor: `#BDBDBD`,
      alignSelf: 'center',
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      marginTop: 24,
      height: 50,
    },
    textStyle: {
      fontSize: 12,
      letterSpacing: 0.5,
      ...(fontStyles.bold as any),
      zIndex: 20,
    },
    loader: {
      backgroundColor: colors.background.default,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    tabBarUnderlineStyle: {
      width: 168 / 2,
    },
  });

/**
 * Main view for the wallet
 */
const Wallet = ({ navigation }: any) => {
  const { drawerRef } = useContext(DrawerContext);
  const [refreshing, setRefreshing] = useState(false);
  const accountOverviewRef = useRef(null);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  /**
   * Map of accounts to information objects including balances
   */
  const accounts = useSelector(
    (state: any) =>
      state.engine.backgroundState.AccountTrackerController.accounts,
  );
  /**
   * ETH to current currency conversion rate
   */
  const conversionRate = useSelector(
    (state: any) =>
      state.engine.backgroundState.CurrencyRateController.conversionRate,
  );
  /**
   * Currency code of the currently-active currency
   */
  const currentCurrency = useSelector(
    (state: any) =>
      state.engine.backgroundState.CurrencyRateController.currentCurrency,
  );
  /**
   * An object containing each identity in the format address => account
   */
  const identities = useSelector(
    (state: any) =>
      state.engine.backgroundState.PreferencesController.identities,
  );
  /**
   * A string that represents the selected address
   */
  const selectedAddress = useSelector(
    (state: any) =>
      state.engine.backgroundState.PreferencesController.selectedAddress,
  );
  /**
   * An array that represents the user tokens
   */
  const tokens = useSelector(
    (state: any) => state.engine.backgroundState.TokensController.tokens,
  );
  /**
   * Current provider ticker
   */
  const ticker = useSelector(
    (state: any) =>
      state.engine.backgroundState.NetworkController.provider.ticker,
  );
  /**
   * Current onboarding wizard step
   */
  const wizardStep = useSelector((state: any) => state.wizard.step);

  const { colors: themeColors } = useTheme();

  /**
   * Check to see if we need to show What's New modal
   */
  useEffect(() => {
    if (wizardStep > 0) {
      // Do not check since it will conflict with the onboarding wizard
      return;
    }
    const checkWhatsNewModal = async () => {
      try {
        const shouldShowWhatsNew = await shouldShowWhatsNewModal();
        if (shouldShowWhatsNew) {
          navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
            screen: Routes.MODAL.WHATS_NEW,
          });
        }
      } catch (error) {
        Logger.log(error, "Error while checking What's New modal!");
      }
    };
    checkWhatsNewModal();
  }, [wizardStep, navigation]);

  useEffect(
    () => {
      requestAnimationFrame(async () => {
        const {
          TokenDetectionController,
          CollectibleDetectionController,
          AccountTrackerController,
        } = Engine.context as any;
        TokenDetectionController.detectTokens();
        CollectibleDetectionController.detectCollectibles();
        AccountTrackerController.refresh();
      });
    },
    /* eslint-disable-next-line */
    [navigation],
  );

  // useEffect(() => {
  //   // navigation.setOptions(
  //   //   Device.isIos()
  //   //     ? getWalletNavbarOptions(
  //   //         'wallet.title',
  //   //         navigation,
  //   //         drawerRef,
  //   //         themeColors,
  //   //       )
  //   //     : {
  //   //         headerShown: false,
  //   //       },
  //   // );
  //   /* eslint-disable-next-line */
  // }, [navigation, themeColors]);

  const onRefresh = useCallback(async () => {
    requestAnimationFrame(async () => {
      setRefreshing(true);
      const {
        TokenDetectionController,
        CollectibleDetectionController,
        AccountTrackerController,
        CurrencyRateController,
        TokenRatesController,
      } = Engine.context as any;
      const actions = [
        TokenDetectionController.detectTokens(),
        CollectibleDetectionController.detectCollectibles(),
        AccountTrackerController.refresh(),
        CurrencyRateController.start(),
        TokenRatesController.poll(),
      ];
      await Promise.all(actions);
      setRefreshing(false);
    });
  }, [setRefreshing]);

  const renderTabBar = useCallback(
    () => (
      <DefaultTabBar
        underlineStyle={styles.tabUnderlineStyle}
        activeTextColor={'#FFFFFF'}
        inactiveTextColor={colors.text.alternative}
        backgroundColor={colors.background.default}
        tabStyle={styles.tabStyle}
        textStyle={styles.textStyle}
        style={styles.tabBar}
        tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
        containerWidth={168}
      />
    ),
    [styles, colors],
  );

  const onChangeTab = useCallback((obj) => {
    InteractionManager.runAfterInteractions(() => {
      if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
        Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_TOKENS);
      } else {
        Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COLLECTIBLES);
      }
    });
  }, []);

  const onRef = useCallback((ref) => {
    accountOverviewRef.current = ref;
  }, []);

  const renderContent = useCallback(() => {
    let balance: any = 0;
    let assets = tokens;
    if (accounts[selectedAddress]) {
      balance = renderFromWei(accounts[selectedAddress].balance);
      assets = [
        {
          name: 'Ether', // FIXME: use 'Ether' for mainnet only, what should it be for custom networks?
          symbol: getTicker(ticker),
          isETH: true,
          balance,
          balanceFiat: weiToFiat(
            hexToBN(accounts[selectedAddress].balance) as any,
            conversionRate,
            currentCurrency,
          ),
          logo: '../images/eth-logo.png',
        },
        ...(tokens || []),
      ];
    } else {
      assets = tokens;
    }
    const account = {
      address: selectedAddress,
      ...identities[selectedAddress],
      ...accounts[selectedAddress],
    };

    return (
      <View style={styles.wrapper}>
        <StatusBar backgroundColor={'#024868'} />
        {(
          getWalletNavbarOptions(
            'wallet.title',
            navigation,
            drawerRef,
            themeColors,
          ) as any
        ).headerTitle()}
        <AccountOverview
          account={account}
          navigation={navigation}
          onRef={onRef}
        />
        <ScrollableTabView
          renderTabBar={renderTabBar}
          // eslint-disable-next-line react/jsx-no-bind
          onChangeTab={onChangeTab}
        >
          <Tokens
            tabLabel={strings('wallet.tokens')}
            key={'tokens-tab'}
            navigation={navigation}
            tokens={assets}
          />
          <CollectibleContracts
            tabLabel={strings('wallet.collectibles')}
            key={'nfts-tab'}
            navigation={navigation}
          />
        </ScrollableTabView>
      </View>
    );
  }, [
    renderTabBar,
    accounts,
    conversionRate,
    currentCurrency,
    identities,
    navigation,
    onChangeTab,
    onRef,
    selectedAddress,
    ticker,
    tokens,
    styles,
  ]);

  const renderLoader = useCallback(
    () => (
      <View style={styles.loader}>
        <ActivityIndicator size="small" />
      </View>
    ),
    [styles],
  );

  /**
   * Return current step of onboarding wizard if not step 5 nor 0
   */
  const renderOnboardingWizard = useCallback(
    () =>
      [1, 2, 3, 4].includes(wizardStep) && (
        <OnboardingWizard
          navigation={navigation}
          coachmarkRef={accountOverviewRef.current}
        />
      ),
    [navigation, wizardStep],
  );

  return (
    <ErrorBoundary view="Wallet">
      <View style={baseStyles.flexGrow} {...generateTestId('wallet-screen')}>
        <ScrollView
          style={styles.wrapper}
          refreshControl={
            <RefreshControl
              colors={[colors.primary.default]}
              tintColor={colors.icon.default}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {selectedAddress ? renderContent() : renderLoader()}
        </ScrollView>
        {renderOnboardingWizard()}
      </View>
    </ErrorBoundary>
  );
};

export default Wallet;
