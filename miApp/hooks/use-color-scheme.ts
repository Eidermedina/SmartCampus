import { useAppTheme } from './use-theme';

export function useColorScheme() {
  const { theme } = useAppTheme();
  return theme;
}
