import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../../../util/theme';
import { getWalletNavbarOptions } from '../Navbar';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const AboutUsScreen = ({ navigation }: any) => {
  const { colors: themeColors } = useTheme();

  return (
    <SafeAreaView style={styles.root}>
      {(
        getWalletNavbarOptions(
          'wallet.title',
          navigation,
          null,
          themeColors,
        ) as any
      ).headerTitle()}
      <WebView source={{ uri: 'https://twendeesoft.com/' }} />
    </SafeAreaView>
  );
};
export default AboutUsScreen;
