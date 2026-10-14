import type { Preview } from '@storybook/react-native-web-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { colors } from '../src/ui/components/common/theme';

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      return (
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 412, height: 915 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <View style={{ minHeight: 915, backgroundColor: colors.surface }}>
            <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', padding: 12 }}>
              <Story />
            </View>
          </View>
        </SafeAreaProvider>
      );
    },
  ],
};

export default preview;
