import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
};

export function AppShell({ title, subtitle, children, rightAction }: AppShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.statusBarBg, { height: insets.top }]} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightAction}
          </View>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

export function LoadingState() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.statusBarBg, { height: insets.top }]} />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>Loading offline data...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  statusBarBg: {
    backgroundColor: '#1f5c56',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102a24',
  },
  subtitle: {
    fontSize: 14,
    color: '#49635d',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f4f7f4',
  },
  loadingText: {
    fontSize: 15,
    color: '#49635d',
  },
});
