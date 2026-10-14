import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  stories: ['../src/ui/components/**/*.stories.tsx', './design/**/*.stories.tsx'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: { modulesToTranspile: ['react-native-svg', 'react-native-safe-area-context'] },
  },
};

export default config;
