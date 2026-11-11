import type { Preview } from '@storybook/web-components-vite';
import { setCustomElementsManifest } from '@storybook/web-components';
import manifest from '@codechem/components/custom-elements.json';
import '@codechem/tokens/tokens.css';
import { MarkdownCode, MarkdownPre } from '../src/docs/CodeBlock';
import '../src/docs/docs.css';
import '@codechem/components';
import { ComponentDocs } from '../src/docs/ComponentDocs';
import { documentationTheme } from '../src/theme';

setCustomElementsManifest(manifest);

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: { expanded: true },
    docs: {
      page: ComponentDocs,
      theme: documentationTheme,
      components: { code: MarkdownCode, pre: MarkdownPre },
    },
    options: {
      storySort: {
        order: [
          'Getting started',
          'Guides',
          ['Framework integration', 'Forms and events', 'Styling and theming'],
          'Foundations',
          ['Tokens', 'Icons'],
          'Components',
        ],
      },
    },
  },
};

export default preview;
