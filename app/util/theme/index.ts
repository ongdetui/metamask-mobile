import { darkTheme, lightTheme } from '@metamask/design-tokens';
import React, { useContext } from 'react';
import { ColorSchemeName, StatusBar, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import Device from '../device';
import { AppThemeKey, Theme } from './models';

/**
 * This is needed to make our unit tests pass since Enzyme doesn't support contextType
 * TODO: Convert classes into functional components and remove contextType
 */
export const mockTheme = {
  colors: {
    ...lightTheme.colors,
    primary: {
      ...lightTheme.colors.primary,
      default: '#004868',
      alternative: '#004868',
    },
    info: {
      ...lightTheme.colors.info,
      alternative: '#004868',
      default: '#004868',
    },
  },
  themeAppearance: 'light',
  typography: lightTheme.typography,
  shadows: lightTheme.shadows,
};

export const ThemeContext = React.createContext<any>(undefined);

/**
 * Utility function for getting asset from theme (Class components)
 *
 * @param appTheme Theme from app
 * @param osColorScheme Theme from OS
 * @param light Light asset
 * @param dark Dark asset
 * @returns
 */
export const getAssetFromTheme = (
  appTheme: AppThemeKey,
  osColorScheme: ColorSchemeName,
  light: any,
  dark: any,
) => {
  let asset = light;
  switch (appTheme) {
    case AppThemeKey.light:
      asset = light;
      break;
    case AppThemeKey.dark:
      asset = dark;
      break;
    case AppThemeKey.os:
      asset = osColorScheme === 'dark' ? dark : light;
      break;
    default:
      asset = light;
  }
  return asset;
};

export const useAppTheme = (): Theme => {
  const osThemeName = useColorScheme();
  const appTheme: AppThemeKey = useSelector(
    (state: any) => state.user.appTheme,
  );
  const themeAppearance = getAssetFromTheme(
    appTheme,
    osThemeName,
    AppThemeKey.light,
    AppThemeKey.dark,
  );
  let colors: Theme['colors'];
  let typography: Theme['typography'];
  let shadows: Theme['shadows'];

  const setDarkStatusBar = () => {
    StatusBar.setBarStyle('light-content', true);
    Device.isAndroid() &&
      StatusBar.setBackgroundColor(darkTheme.colors.background.default);
  };

  const setLightStatusBar = () => {
    StatusBar.setBarStyle('dark-content', true);
    Device.isAndroid() &&
      StatusBar.setBackgroundColor(lightTheme.colors.background.default);
  };

  switch (appTheme) {
    /* eslint-disable no-fallthrough */
    case AppThemeKey.os: {
      if (osThemeName === AppThemeKey.light) {
        colors = lightTheme.colors;
        typography = lightTheme.typography;
        shadows = lightTheme.shadows;
        setLightStatusBar();
        break;
      } else if (osThemeName === AppThemeKey.dark && false) {
        colors = darkTheme.colors;
        typography = darkTheme.typography;
        shadows = darkTheme.shadows;
        setDarkStatusBar();
        break;
      } else {
        // Cover cases where OS returns undefined
        colors = lightTheme.colors;
        typography = lightTheme.typography;
        shadows = lightTheme.shadows;
        setLightStatusBar();
      }
    }
    case AppThemeKey.light:
      colors = lightTheme.colors;
      typography = lightTheme.typography;
      shadows = lightTheme.shadows;
      setLightStatusBar();
      break;
    case AppThemeKey.dark:
      colors = lightTheme.colors;
      typography = lightTheme.typography;
      shadows = lightTheme.shadows;
      setLightStatusBar();
      // colors = darkTheme.colors;
      // typography = darkTheme.typography;
      // shadows = darkTheme.shadows;
      // setDarkStatusBar();
      break;
    default:
      // Default uses light theme
      colors = lightTheme.colors;
      typography = lightTheme.typography;
      shadows = lightTheme.shadows;
      setLightStatusBar();
  }

  return { colors, themeAppearance, typography, shadows };
};

export const useAppThemeFromContext = (): Theme => {
  const theme = useContext<Theme>(ThemeContext);
  return theme;
};

export const useTheme = (): Theme => {
  const theme: any = useAppThemeFromContext() || mockTheme;
  return theme.themeAppearance === 'light'
    ? {
        ...theme,
        colors: {
          ...theme.colors,
          primary: {
            ...theme.colors.primary,
            default: '#004868',
            alternative: '#004868',
          },
          info: {
            ...theme.colors.info,
            alternative: '#004868',
            default: '#004868',
          },
        },
      }
    : theme;
};

/**
 * Hook that returns asset based on theme (Functional components)
 *
 * @param light Light asset
 * @param dark Dark asset
 * @returns Asset based on theme
 */
export const useAssetFromTheme = (light: any, dark: any) => {
  const osColorScheme = useColorScheme();
  const appTheme = useSelector((state: any) => state.user.appTheme);
  const asset = getAssetFromTheme(appTheme, osColorScheme, light, dark);

  return asset;
};
