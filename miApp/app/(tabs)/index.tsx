import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Dashboard } from '@/components/smart-campus/Dashboard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Dashboard />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
