import { StyleSheet } from 'react-native';

export const colors = {
  surface: '#191C1A',
  surfaceContainer: '#292E2A',
  surfaceHigh: '#333B34',
  onSurface: '#F0EDE5',
  muted: '#BAC2B6',
  primary: '#B6C7A8',
  onPrimary: '#202B1E',
  outline: '#465044',
  error: '#FFB4AB',
  success: '#B7D9AB',
  boardLight: '#E7E5D8',
  boardDark: '#7F9276',
  boardSelected: '#B6C7A8',
} as const;

export const fontFamilies = {
  regular: 'Chess69Regular',
  semibold: 'Chess69Semibold',
  bold: 'Chess69Bold',
} as const;

export const typography = { fontFamily: fontFamilies.regular } as const;

export const layout = StyleSheet.create({
  body: { ...typography, color: colors.onSurface, fontSize: 16, lineHeight: 24 },
  muted: { ...typography, color: colors.muted, fontSize: 14, lineHeight: 21 },
  title: {
    ...typography,
    color: colors.onSurface,
    fontSize: 26,
    lineHeight: 34,
    fontFamily: fontFamilies.bold,
    fontWeight: 'normal',
  },
  section: {
    ...typography,
    color: colors.onSurface,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fontFamilies.semibold,
    fontWeight: 'normal',
    marginTop: 24,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  stack: { gap: 12 },
  panel: {
    backgroundColor: colors.surfaceContainer,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 5,
    borderColor: colors.outline,
    gap: 8,
  },
});
