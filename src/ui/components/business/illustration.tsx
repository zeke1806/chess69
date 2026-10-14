import { Image, View } from 'react-native';
import atlasSource from '../../../assets/illustrations.png';

export type IllustrationKind = 'knight' | 'book' | 'puzzle' | 'rook';
const cells = { knight: [0, 0], book: [1, 0], puzzle: [0, 1], rook: [1, 1] } as const;

export function Illustration({
  kind,
  size = 84,
}: Readonly<{ kind: IllustrationKind; size?: number }>) {
  const [column, row] = cells[kind];
  return (
    <View accessible={false} style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={atlasSource}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          left: -column * size,
          top: -row * size,
        }}
      />
    </View>
  );
}
