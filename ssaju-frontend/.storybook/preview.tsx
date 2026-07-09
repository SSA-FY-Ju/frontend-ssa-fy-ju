import type { Preview } from '@storybook/nextjs'
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import '../src/app/globals.css';
import '../src/styles/landing.css';

initialize({ onUnhandledRequest: 'bypass' });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    msw: { handlers },
  },
  loaders: [mswLoader],
};

export default preview;