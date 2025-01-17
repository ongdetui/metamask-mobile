import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import {
  toggleAccountsModal,
  toggleNetworkModal,
} from '../../../actions/modals';
import { colors as importedColors, fontStyles } from '../../../styles/common';
import Device from '../../../util/device';
import Networks from '../../../util/networks';
import { mockTheme, ThemeContext } from '../../../util/theme';
import Identicon from '../Identicon';

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      // alignItems: 'center',
      // flex: 1,
    },
    network: {
      flexDirection: 'row',
    },
    networkName: {
      fontSize: 15,
      color: colors.text.alternative,
      ...fontStyles.bold,
    },
    networkIcon: {
      width: 5,
      height: 5,
      borderRadius: 100,
      marginRight: 5,
      marginTop: Device.isIos() ? 7 : 8,
    },
    title: {
      fontSize: 18,
      ...fontStyles.normal,
      color: colors.text.default,
    },
    otherNetworkIcon: {
      backgroundColor: importedColors.transparent,
      borderColor: colors.border.default,
      borderWidth: 1,
    },

    logo: {
      width: 90,
      height: 110,
      marginLeft: 10,
      position: 'absolute',
      right: 15,
      bottom: -30,
    },

    container: {
      alignItems: 'center',
      width: Device.getDeviceWidth(),
      backgroundColor: `#024868`,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      top: -20,
      height: Device.isIphoneX() ? 150 : 140,
      justifyContent: 'flex-end',
      paddingBottom: 55,
    },

    identiconBorder: {
      position: 'absolute',
      backgroundColor: `#FFFFFF`,
      bottom: -35,
      width: 70,
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 35,
    },
  });

/**
 * UI PureComponent that renders inside the navbar
 * showing the view title and the selected network
 */
class NavbarTitle extends PureComponent {
  static propTypes = {
    /**
     * Object representing the selected the selected network
     */
    network: PropTypes.object.isRequired,
    /**
     * Name of the current view
     */
    title: PropTypes.string,
    /**
     * Action that toggles the network modal
     */
    toggleNetworkModal: PropTypes.func,
    /**
     * Boolean that specifies if the title needs translation
     */
    translate: PropTypes.bool,
    /**
     * Boolean that specifies if the network can be changed
     */
    disableNetwork: PropTypes.bool,

    address: PropTypes.string,

    navMain: PropTypes.bool,

    toggleAccountsModal: PropTypes.func,
  };

  static defaultProps = {
    translate: true,
  };

  animating = false;

  openNetworkList = () => {
    if (!this.props.disableNetwork) {
      if (!this.animating) {
        this.animating = true;
        this.props.toggleNetworkModal();
        setTimeout(() => {
          this.animating = false;
        }, 500);
      }
    }
  };

  render = () => {
    const { network, title, translate, navMain } = this.props;
    let name = null;
    const color =
      (Networks[network.provider.type] &&
        Networks[network.provider.type].color) ||
      null;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    if (network.provider.nickname) {
      name = network.provider.nickname;
    } else {
      name =
        (Networks[network.provider.type] &&
          Networks[network.provider.type].name) ||
        { ...Networks.rpc, color: null }.name;
    }

    const realTitle = translate ? strings(title) : title;

    return (
      <View style={navMain && styles.container}>
        {navMain && (
          <Image
            style={styles.logo}
            source={require('../../../images/bg-logo.png')}
          />
        )}

        <TouchableOpacity
          onPress={this.openNetworkList}
          style={styles.wrapper}
          activeOpacity={this.props.disableNetwork ? 1 : 0.2}
          testID={'open-networks-button'}
        >
          {/* {title ? (
          <Text numberOfLines={1} style={styles.title}>
            {'Tween Wallet'}
          </Text>
        ) : null} */}
          <View style={styles.network}>
            <View
              style={[
                styles.networkIcon,
                color ? { backgroundColor: color } : styles.otherNetworkIcon,
              ]}
            />
            <Text
              numberOfLines={1}
              style={[styles.networkName, navMain && { color: `#fff` }]}
              testID={'navbar-title-network'}
              accessibilityLabel={'navbar-title-network'}
            >
              {name}
            </Text>
          </View>
        </TouchableOpacity>
        {navMain && (
          <TouchableOpacity
            style={styles.identiconBorder}
            // disabled={onboardingWizard}
            onPress={this.props.toggleAccountsModal}
            testID={'wallet-account-identicon'}
          >
            <Identicon
              address={this.props.address}
              diameter={60}
              // noFadeIn={onboardingWizard}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
}

NavbarTitle.contextType = ThemeContext;

const mapStateToProps = (state) => ({
  network: state.engine.backgroundState.NetworkController,
  address: state.engine.backgroundState.PreferencesController.selectedAddress,
});
const mapDispatchToProps = (dispatch) => ({
  toggleNetworkModal: () => dispatch(toggleNetworkModal()),
  toggleAccountsModal: () => dispatch(toggleAccountsModal()),
});
export default connect(mapStateToProps, mapDispatchToProps)(NavbarTitle);
