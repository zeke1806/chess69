import { StyleSheet } from 'react-native';

export const colors = {
  surface: '#111318',
  surfaceContainer: '#1D2027',
  surfaceHigh: '#292D36',
  onSurface: '#F3F0E8',
  muted: '#BCC1CC',
  primary: '#FF9F43',
  onPrimary: '#241506',
  outline: '#454A56',
  error: '#FFB4AB',
  success: '#B7D9AB',
  boardLight: '#E4D9C5',
  boardDark: '#7B6553',
  boardSelected: '#FF9F43',
} as const;

export const layout = StyleSheet.create({
  body: { color: colors.onSurface, fontSize: 16, lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  title: { color: colors.onSurface, fontSize: 26, lineHeight: 34, fontWeight: '700' },
  section: {
    color: colors.onSurface,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  stack: { gap: 12 },
  panel: { backgroundColor: colors.surfaceContainer, padding: 16, borderRadius: 12, gap: 8 },
});
