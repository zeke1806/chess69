import { View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { layout } from './theme';

export function Panel({ children }: PropsWithChildren) {
  return <View style={layout.panel}>{children}</View>;
}
