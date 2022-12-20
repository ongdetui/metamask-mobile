import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../locales/i18n';
import { fontStyles } from '../../../styles/common';
import Device from '../../../util/device';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `#FFFFFF`,
    height: 70 + (Device.isIphoneX() ? 15 : 0),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: `#33333340`,
    shadowOffset: {
      width: 1,
      height: 0,
    },
    shadowOpacity: 0.8,
    paddingBottom: Device.isIphoneX() ? 10 : 0,
  },

  itemTab: {
    alignItems: 'center',
    flex: 1,
  },

  menuItemIconImage: {
    width: 22,
    height: 22,
    tintColor: `#004868`,
  },
  textTitleTab: {
    fontSize: 13,
    ...fontStyles.normal,
    marginTop: 4,
  },
});

const CustomTabNavigation = ({ state, descriptors, navigation }: any) => (
  <View style={styles.container}>
    {state.routes.map((route: any, index: number) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate({ name: route.name, merge: true });
        }
      };

      return (
        <TouchableOpacity
          key={index}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          testID={options.tabBarTestID}
          onPress={onPress}
          style={styles.itemTab}
        >
          {label === 'WalletTabHome' ? (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('../../../images/wallet-icon.png')}
              style={[
                styles.menuItemIconImage,
                {
                  tintColor: isFocused ? `#004868` : `#33333390`,
                },
              ]}
            />
          ) : label === 'BrowserTabHome' ? (
            <Icon
              name={'globe'}
              size={24}
              color={isFocused ? `#004868` : `#33333390`}
            />
          ) : (
            <FeatherIcon
              name={'settings'}
              size={24}
              color={isFocused ? `#004868` : `#33333390`}
            />
          )}
          <Text
            style={[
              styles.textTitleTab,
              { color: isFocused ? `#004868` : `#33333390` },
            ]}
          >
            {strings(
              label === 'WalletTabHome'
                ? 'bottom_tab_bar.wallet'
                : label === 'BrowserTabHome'
                ? 'drawer.browser'
                : 'drawer.settings',
            )}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default CustomTabNavigation;
