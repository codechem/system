import type { Preview } from '@storybook/web-components-vite';
import { setCustomElementsManifest } from '@storybook/web-components';
import manifest from '@codechem/components/custom-elements.json';
import '@codechem/tokens/tokens.css';

setCustomElementsManifest(manifest);

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: { expanded: true },
    options: {
      storySort: { order: ['Getting started', 'Foundations', ['Tokens', 'Icons'], 'Components'] },
    },
  },
};

export default preview;
