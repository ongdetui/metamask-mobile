import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { strings } from '../../../../locales/i18n';
import AppConstants from '../../../core/AppConstants';
import { fontStyles } from '../../../styles/common';
import { mockTheme, ThemeContext } from '../../../util/theme';

const createStyles = (colors) =>
  StyleSheet.create({
    text: {
      ...fontStyles.normal,
      color: colors.text.alternative,
      textAlign: 'center',
      fontSize: 10,
    },
    link: {
      textDecorationLine: 'underline',
    },
  });

/**
 * View that is displayed in the flow to agree terms and conditions
 */
export default class TermsAndConditions extends PureComponent {
  static propTypes = {
    /**
    /* navigation object required to push and pop other views
    */
    navigation: PropTypes.object,
  };

  press = () => {
    const { navigation } = this.props;
    navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: AppConstants.URLS.TERMS_AND_CONDITIONS,
        title: strings('terms_and_conditions.title'),
      },
    });
  };

  render() {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      // <TouchableOpacity
      //   {...generateTestId(Platform, TERMS_AND_CONDITIONS_BUTTON_ID)}
      //   onPress={this.press}
      // >
      //   <Text style={styles.text}>
      //     {strings('terms_and_conditions.description')}
      //     <Text style={styles.link}>
      //       {strings('terms_and_conditions.terms')}
      //     </Text>
      //     .
      //   </Text>
      // </TouchableOpacity>
      <></>
    );
  }
}

TermsAndConditions.contextType = ThemeContext;
