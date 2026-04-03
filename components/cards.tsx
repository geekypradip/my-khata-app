import { StyleSheet, Text, View } from 'react-native';

type SummaryCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
  compact?: boolean;
};

type BreakdownCardProps = {
  title: string;
  total: number;
  active: number;
  settled: number;
};

type EntryBreakdownCardProps = {
  total: number;
  people: number;
  expenses: number;
};

export function SummaryCard({ label, value, tone = 'default', compact = false }: SummaryCardProps) {
  return (
    <View
      style={[
        styles.card,
        compact && styles.compactCard,
        tone === 'positive' && styles.positiveCard,
        tone === 'negative' && styles.negativeCard,
      ]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text
        style={[
          styles.cardValue,
          compact && styles.compactCardValue,
          tone === 'positive' && styles.positiveText,
          tone === 'negative' && styles.negativeText,
        ]}>
        {value}
      </Text>
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function BreakdownCard({ title, total, active, settled }: BreakdownCardProps) {
  return (
    <View style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      <Text style={styles.breakdownTotal}>{total}</Text>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownPill}>
          <Text style={styles.breakdownPillLabel}>Active</Text>
          <Text style={styles.breakdownPillValue}>{active}</Text>
        </View>
        <View style={styles.breakdownPill}>
          <Text style={styles.breakdownPillLabel}>Settled</Text>
          <Text style={styles.breakdownPillValue}>{settled}</Text>
        </View>
      </View>
    </View>
  );
}

export function EntryBreakdownCard({ total, people, expenses }: EntryBreakdownCardProps) {
  return (
    <View style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>Entries</Text>
      <Text style={styles.breakdownTotal}>{total}</Text>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownPill}>
          <Text style={styles.breakdownPillLabel}>People</Text>
          <Text style={styles.breakdownPillValue}>{people}</Text>
        </View>
        <View style={styles.breakdownPill}>
          <Text style={styles.breakdownPillLabel}>Expenses</Text>
          <Text style={styles.breakdownPillValue}>{expenses}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d8e4de',
    gap: 8,
  },
  compactCard: {
    paddingVertical: 10,
  },
  positiveCard: {
    backgroundColor: '#eefbf3',
    borderColor: '#b8e4c3',
  },
  negativeCard: {
    backgroundColor: '#fff2f2',
    borderColor: '#f0c1c1',
  },
  cardLabel: {
    fontSize: 13,
    color: '#5d726c',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a24',
  },
  compactCardValue: {
    fontSize: 20,
  },
  positiveText: {
    color: '#0f8a43',
  },
  negativeText: {
    color: '#c43d3d',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#d8e4de',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#102a24',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#5d726c',
    textAlign: 'center',
  },
  breakdownCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d8e4de',
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a24',
  },
  breakdownTotal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#102a24',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
  },
  breakdownPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#f3f7f5',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  breakdownPillLabel: {
    fontSize: 12,
    color: '#5d726c',
  },
  breakdownPillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102a24',
  },
});
