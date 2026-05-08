import { Platform } from 'react-native';

/**
 * Paleta Institucional Universidad de Cundinamarca (UdeC)
 */
const UdeC = {
  darkGreen: '#00482B',
  corporateGreen: '#007B3E',
  lightGreen: '#79C000',
  yellow: '#FBE122',
  golden: '#DAAA00',
  orange: '#F7931E',
  teal: '#00A99D',
  white: '#FFFFFF',
  black: '#050505',
  darkGrey: '#1C1C1E',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: UdeC.corporateGreen,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: UdeC.corporateGreen,
    primary: UdeC.corporateGreen,
    secondary: UdeC.darkGreen,
    accent: UdeC.golden,
    card: '#F2F2F7',
    border: '#E5E5EA',
    notification: UdeC.orange,
    success: UdeC.teal,
    warning: UdeC.golden,
    error: '#FF3B30',
    muted: '#8E8E93',
    darkGrey: UdeC.darkGrey,
  },
  dark: {
    text: '#E5E5EA',
    background: UdeC.black,
    tint: UdeC.lightGreen,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: UdeC.lightGreen,
    primary: UdeC.lightGreen,
    secondary: UdeC.corporateGreen,
    accent: UdeC.yellow,
    card: '#121212',
    border: '#2C2C2E',
    notification: UdeC.orange,
    success: UdeC.teal,
    warning: UdeC.yellow,
    error: '#FF453A',
    muted: '#8E8E93',
    darkGrey: UdeC.darkGrey,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
