import regularFontUrl from '../src/assets/manrope-400.ttf?url';
import semiboldFontUrl from '../src/assets/manrope-600.ttf?url';
import boldFontUrl from '../src/assets/manrope-700.ttf?url';
import displayFontUrl from '../src/assets/manrope.ttf?url';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import type { Preview } from '@storybook/react-native-web-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/ui/components/common/theme';

const preview: Preview = {
  initialGlobals: {
    catalogueWidth: '412',
    viewport: { value: 'mobile2', isRotated: false },
  },
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
    viewport: { options: MINIMAL_VIEWPORTS },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Design',
          'Common',
          ['Design', 'Buttons', 'Inputs', 'Containers'],
          'Business',
          ['Pages', ['Application'], 'Layout', 'Chess'],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const width = Number(context.globals.catalogueWidth ?? 412);
      const frame = context.parameters.presentationFrame;
      const isDesign = frame === 'design' || frame === 'design-moodboard';
      const isApplication = frame === 'application' || frame === 'design';
      return (
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width, height: 915 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <style>{`@font-face { font-family: Chess69Display; src: url('${displayFontUrl}') format('truetype'); font-weight: 200 800; font-style: normal; font-display: swap; }
            @font-face { font-family: Chess69Regular; src: url('${regularFontUrl}') format('truetype'); font-weight: normal; font-display: swap; }
            @font-face { font-family: Chess69Semibold; src: url('${semiboldFontUrl}') format('truetype'); font-weight: normal; font-display: swap; }
            @font-face { font-family: Chess69Bold; src: url('${boldFontUrl}') format('truetype'); font-weight: normal; font-display: swap; }`}</style>
          <div
            style={{ minHeight: '100vh', backgroundColor: isDesign ? '#191C1A' : colors.surface }}
          >
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
                ...(isApplication
                  ? { height: '100vh' }
                  : { padding: isDesign ? 0 : 12, minHeight: 915 }),
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
