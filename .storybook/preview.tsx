import type { Preview } from '@storybook/react-native-web-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/ui/components/common/theme';

const preview: Preview = {
  initialGlobals: { catalogueWidth: '412' },
  globalTypes: {
    catalogueWidth: {
      description: 'Largeur du catalogue en pixels',
      toolbar: {
        title: 'Largeur',
        icon: 'mobile',
        dynamicTitle: true,
        items: [
          { value: '360', title: 'Compact · 360 px' },
          { value: '412', title: 'Téléphone · 412 px' },
          { value: '480', title: 'Large · 480 px' },
        ],
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Common',
          ['Buttons', 'Inputs', 'Containers'],
          'Business',
          ['Pages', ['Application'], 'Layout', 'Chess'],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const width = Number(context.globals.catalogueWidth ?? 412);
      const isApplication = context.parameters.presentationFrame === 'application';
      return (
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width, height: 915 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <div style={{ minHeight: '100vh', backgroundColor: colors.surface }}>
            <div
              data-testid={
                isApplication ? 'storybook-application-frame' : 'storybook-component-frame'
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                maxWidth: width,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                ...(isApplication ? { height: '100vh' } : { padding: 12, minHeight: 915 }),
              }}
            >
              <Story />
            </div>
          </div>
        </SafeAreaProvider>
      );
    },
  ],
};

export default preview;
