import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  Alert,
  InteractionManager,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { logOut } from '../../../actions/user';
import Routes from '../../../constants/navigation/Routes';
import Analytics from '../../../core/Analytics/Analytics';
import Engine from '../../../core/Engine';
import SecureKeychain from '../../../core/SecureKeychain';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { mockTheme, ThemeContext } from '../../../util/theme';
import { getClosableNavigationOptions } from '../../UI/Navbar';
import SettingsDrawer from '../../UI/SettingsDrawer';

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.background.default,
      flex: 1,
      paddingLeft: 18,
      zIndex: 99999999999999,
    },
  });

/**
 * Main view for app configurations
 */
class Settings extends PureComponent {
  static propTypes = {
    /**
    /* navigation object required to push new views
    */
    navigation: PropTypes.object,
    /**
     * redux flag that indicates if the user
     * completed the seed phrase backup flow
     */
    seedphraseBackedUp: PropTypes.bool,
    passwordSet: PropTypes.bool,
    logOut: PropTypes.func,
  };

  updateNavBar = () => {
    const { navigation } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    navigation.setOptions(
      getClosableNavigationOptions(
        strings('app_settings.title'),
        null,
        navigation,
        colors,
      ),
    );
  };

  componentDidMount = () => {
    this.updateNavBar();
  };

  componentDidUpdate = () => {
    this.updateNavBar();
  };

  onPressGeneral = () => {
    InteractionManager.runAfterInteractions(() =>
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SETTINGS_GENERAL),
    );
    this.props.navigation.navigate('GeneralSettings');
  };

  onPressAdvanced = () => {
    InteractionManager.runAfterInteractions(() =>
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SETTINGS_ADVANCED),
    );
    this.props.navigation.navigate('AdvancedSettings');
  };

  onPressSecurity = () => {
    InteractionManager.runAfterInteractions(() =>
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SETTINGS_SECURITY_AND_PRIVACY),
    );
    this.props.navigation.navigate('SecuritySettings');
  };

  onPressNetworks = () => {
    this.props.navigation.navigate('NetworksSettings');
  };

  onPressExperimental = () => {
    InteractionManager.runAfterInteractions(() =>
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SETTINGS_EXPERIMENTAL),
    );
    this.props.navigation.navigate('ExperimentalSettings');
  };

  onPressInfo = () => {
    InteractionManager.runAfterInteractions(() =>
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SETTINGS_ABOUT),
    );
    this.props.navigation.navigate('CompanySettings');
  };

  onPressContacts = () => {
    this.props.navigation.navigate('ContactsSettings');
  };

  logOut = () => {
    this.props.navigation.navigate(Routes.ONBOARDING.LOGIN);
    this.props.logOut();
  };

  onPress = async () => {
    const { passwordSet } = this.props;
    const { KeyringController } = Engine.context;
    await SecureKeychain.resetGenericPassword();
    await KeyringController.setLocked();
    if (!passwordSet) {
      this.props.navigation.navigate('OnboardingRootNav', {
        screen: Routes.ONBOARDING.NAV,
        params: { screen: 'Onboarding' },
      });
    } else {
      this.logOut();
    }
  };

  trackEvent = (event) => {
    InteractionManager.runAfterInteractions(() => {
      Analytics.trackEvent(event);
    });
  };

  logout = () => {
    Alert.alert(
      strings('drawer.lock_title'),
      '',
      [
        {
          text: strings('drawer.lock_cancel'),
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: strings('drawer.lock_ok'),
          onPress: this.onPress,
        },
      ],
      { cancelable: false },
    );
    this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_LOGOUT);
  };

  render = () => {
    const { seedphraseBackedUp } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <ScrollView style={styles.wrapper}>
        <SettingsDrawer
          description={strings('app_settings.general_desc')}
          onPress={this.onPressGeneral}
          title={strings('app_settings.general_title')}
        />
        <SettingsDrawer
          description={strings('app_settings.security_desc')}
          onPress={this.onPressSecurity}
          title={strings('app_settings.security_title')}
          warning={!seedphraseBackedUp}
        />
        {/* <SettingsDrawer
          description={strings('app_settings.advanced_desc')}
          onPress={this.onPressAdvanced}
          title={strings('app_settings.advanced_title')}
        /> */}
        <SettingsDrawer
          description={strings('app_settings.contacts_desc')}
          onPress={this.onPressContacts}
          title={strings('app_settings.contacts_title')}
        />
        <SettingsDrawer
          title={strings('app_settings.networks_title')}
          description={strings('app_settings.networks_desc')}
          onPress={this.onPressNetworks}
        />
        <SettingsDrawer
          title={strings('drawer.lock')}
          description={'Lock wallet'}
          onPress={this.logout}
        />
        {/* <SettingsDrawer
          title={strings('app_settings.experimental_title')}
          description={strings('app_settings.experimental_desc')}
          onPress={this.onPressExperimental}
        /> */}
        {/* <SettingsDrawer
          title={strings('app_settings.info_title')}
          onPress={this.onPressInfo}
        /> */}
      </ScrollView>
    );
  };
}

Settings.contextType = ThemeContext;

const mapStateToProps = (state) => ({
  seedphraseBackedUp: state.user.seedphraseBackedUp,
  passwordSet: state.user.passwordSet,
});

const mapDispatchToProps = (dispatch) => ({
  logOut: () => dispatch(logOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
