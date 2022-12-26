import { RightIcon } from 'images/icon';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { mockTheme, ThemeContext } from '../../../util/theme';

const createStyles = (colors) =>
  StyleSheet.create({
    itemWrapper: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 10,
      // borderBottomWidth: StyleSheet.hairlineWidth,
      // borderBottomColor: colors.border.muted,
      backgroundColor: `#FFFFFF`,
      alignItems: 'center',
      marginHorizontal: 16,
      shadowColor: `rgba(0, 0, 0, 0.2)`,
      shadowOffset: {
        width: 1,
        height: 1,
      },
      elevation: 3,
      shadowOpacity: 1,
      borderRadius: 12,
      marginBottom: 12,
    },
    arrow: {
      flex: 1,
      alignSelf: 'flex-end',
    },
    arrowIcon: {
      marginTop: 16,
    },
  });

/**
 * Customizable view to render assets in lists
 */
export default class AssetElement extends PureComponent {
  static propTypes = {
    /**
     * Content to display in the list element
     */
    children: PropTypes.node,
    /**
     * Object being rendered
     */
    asset: PropTypes.object,
    /**
     * Callback triggered on long press
     */
    onPress: PropTypes.func,
    /**
     * Callback triggered on long press
     */
    onLongPress: PropTypes.func,
  };

  handleOnPress = () => {
    const { onPress, asset } = this.props;
    onPress && onPress(asset);
  };

  handleOnLongPress = () => {
    const { onLongPress, asset } = this.props;
    onLongPress && onLongPress(asset);
  };

  render = () => {
    const { children } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <TouchableOpacity
        onPress={this.handleOnPress}
        onLongPress={this.handleOnLongPress}
        style={styles.itemWrapper}
      >
        {children}
        {/* <View styles={styles.arrow}> */}
        <RightIcon />
        {/* </View> */}
      </TouchableOpacity>
    );
  };
}

AssetElement.contextType = ThemeContext;
