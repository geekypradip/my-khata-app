import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  fixedHeight,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  fixedHeight?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b9a95"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, fixedHeight ? { height: fixedHeight } : null]}
      />
    </View>
  );
}

export function PillButton({
  title,
  onPress,
  tone = 'primary',
}: {
  title: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' && styles.secondaryButton,
        tone === 'danger' && styles.dangerButton,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          styles.buttonText,
          tone === 'secondary' && styles.secondaryButtonText,
          tone === 'danger' && styles.dangerButtonText,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}>
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#37524b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c8d8d2',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#102a24',
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8d8d2',
  },
  dangerButton: {
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#efb9b9',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#23423b',
  },
  dangerButtonText: {
    color: '#ba3a3a',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#e7eeeb',
    borderRadius: 14,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#ffffff',
  },
  segmentLabel: {
    fontSize: 14,
    color: '#59706a',
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: '#0f766e',
  },
});
