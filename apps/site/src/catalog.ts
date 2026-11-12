export type Entry = {
  slug: string;
  hint: string;
  name: string;
  tag: string;
  path: string;
  summary: string;
  demo: string;
};

export type Group = { name: string; code: string; entries: Entry[] };

const icon = (name: string, slot = 'leading') =>
  `<span slot="${slot}" class="material-icons-round" aria-hidden="true">${name}</span>`;

export const catalog: Group[] = [
  {
    name: 'Actions',
    code: 'AC',
    entries: [
      {
        slug: 'button',
        hint: 'Four variants, three colours',
        name: 'Button',
        tag: 'cc-button',
        path: 'button.js',
        summary: 'Filled, outlined, text and accent variants in three colours and three sizes, with optional icons.',
        demo: `<cc-button>${icon('add')}New project</cc-button>
          <cc-button variant="outlined">Preview</cc-button>
          <cc-button variant="text" color="secondary">Cancel</cc-button>
          <cc-button color="destructive">Delete</cc-button>`,
      },
      {
        slug: 'link',
        hint: 'Inline or standalone',
        name: 'Link',
        tag: 'cc-link',
        path: 'link.js',
        summary: 'An inline or standalone link in four sizes, with an optional leading icon.',
        demo: `<cc-link href="#link">Read the release notes</cc-link>
          <cc-link href="#link" size="small">Changelog</cc-link>`,
      },
      {
        slug: 'chip',
        hint: 'Click to toggle',
        name: 'Chip',
        tag: 'cc-chip',
        path: 'chip.js',
        summary: 'Filter chips that toggle, and removable input chips for tags and recipients.',
        demo: `<cc-chip selected>Remote</cc-chip>
          <cc-chip>Full time</cc-chip>
          <cc-chip>Contract</cc-chip>
          <div style="flex-basis: 100%; height: 0"></div>
          <cc-chip type="input" removable>TypeScript</cc-chip>`,
      },
    ],
  },
  {
    name: 'Inputs',
    code: 'IN',
    entries: [
      {
        slug: 'text-input',
        hint: 'Type to see the label float',
        name: 'Text input',
        tag: 'cc-text-input',
        path: 'text-input.js',
        summary: 'A labelled field with supporting text, error state, and required or optional markers.',
        demo: `<cc-text-input label="Work email" placeholder="john.doe@example.com" supporting-text="We only use it for sign-in." required></cc-text-input>`,
      },
      {
        slug: 'textarea',
        hint: 'Grows with your brief',
        name: 'Textarea',
        tag: 'cc-textarea',
        path: 'textarea.js',
        summary: 'Multi-line input that follows the same label and supporting-text pattern.',
        demo: `<cc-textarea label="Project brief" placeholder="What are we building?"></cc-textarea>`,
      },
      {
        slug: 'search-bar',
        hint: 'Press Enter to search',
        name: 'Search bar',
        tag: 'cc-search-bar',
        path: 'search-bar.js',
        summary: 'A compact search field with a trailing search icon and room for a leading slot.',
        demo: `<cc-search-bar placeholder="Search people, projects, clients"></cc-search-bar>`,
      },
      {
        slug: 'number-input-stepper',
        hint: 'Arrow keys work too',
        name: 'Number input stepper',
        tag: 'cc-number-input-stepper',
        path: 'number-input-stepper.js',
        summary: 'Numeric input with increment and decrement buttons, min, max and step.',
        demo: `<cc-number-input-stepper aria-label="Team size" value="4" min="1" max="12"></cc-number-input-stepper>`,
      },
      {
        slug: 'checkbox',
        hint: 'Space toggles',
        name: 'Checkbox',
        tag: 'cc-checkbox',
        path: 'checkbox.js',
        summary: 'A form-ready checkbox with checked, indeterminate and disabled states.',
        demo: `<cc-checkbox checked>Send me release notes</cc-checkbox>
          <cc-checkbox>Join the beta</cc-checkbox>`,
      },
      {
        slug: 'radio',
        hint: 'Arrow keys move selection',
        name: 'Radio group',
        tag: 'cc-radio-group',
        path: 'radio.js',
        summary: 'A radio group with arrow-key navigation, used with cc-radio options.',
        demo: `<cc-radio-group aria-label="Billing period" name="billing" value="yearly">
            <cc-radio value="monthly">Monthly</cc-radio>
            <cc-radio value="yearly">Yearly</cc-radio>
          </cc-radio-group>`,
      },
      {
        slug: 'switch',
        hint: 'Takes effect immediately',
        name: 'Switch',
        tag: 'cc-switch',
        path: 'switch.js',
        summary: 'An on/off toggle for settings that take effect immediately.',
        demo: `<cc-switch checked>Email notifications</cc-switch>
          <cc-switch>Weekly digest</cc-switch>`,
      },
      {
        slug: 'calendar',
        hint: 'Pick a date',
        name: 'Calendar',
        tag: 'cc-calendar',
        path: 'calendar.js',
        summary: 'A single-date picker with min and max dates and locale-aware labels.',
        demo: `<cc-calendar></cc-calendar>`,
      },
    ],
  },
  {
    name: 'Feedback',
    code: 'FB',
    entries: [
      {
        slug: 'alert',
        hint: 'Status colours stay put',
        name: 'Alert',
        tag: 'cc-alert',
        path: 'alert.js',
        summary: 'Success, info, warning and error messages, in subtle or solid style, optionally dismissible.',
        demo: `<cc-alert status="success"><span slot="title">Changes saved</span>Your profile is up to date.</cc-alert>
          <cc-alert status="warning" variant="solid"><span slot="title">Trial ends in 3 days</span>Add a billing method to keep access.</cc-alert>`,
      },
      {
        slug: 'badge',
        hint: 'Ten hues, three styles',
        name: 'Badge',
        tag: 'cc-badge',
        path: 'badge.js',
        summary: 'Status labels and counters in ten colours, as text, number or dot.',
        demo: `<cc-badge color="green">Active</cc-badge>
          <cc-badge color="yellow" variant="subtle">Pending</cc-badge>
          <cc-badge color="red" variant="outline">Blocked</cc-badge>
          <cc-badge type="number">12</cc-badge>`,
      },
      {
        slug: 'tooltip',
        hint: 'Hover or focus the button',
        name: 'Tooltip',
        tag: 'cc-tooltip',
        path: 'tooltip.js',
        summary: 'A short hint anchored to its trigger with CSS anchor positioning.',
        demo: `<cc-button id="tooltip-demo" variant="outlined">Hover or focus me</cc-button>
          <cc-tooltip for="tooltip-demo" placement="top">Copies the share link</cc-tooltip>`,
      },
    ],
  },
  {
    name: 'Navigation',
    code: 'NV',
    entries: [
      {
        slug: 'tab',
        hint: 'Click a tab',
        name: 'Tabs',
        tag: 'cc-tab',
        path: 'tab.js',
        summary: 'Enclosed or line tabs, placed inside an element with role="tablist".',
        demo: `<div role="tablist" aria-label="Profile sections" class="tablist">
            <cc-tab type="line" selected>Overview</cc-tab>
            <cc-tab type="line">Experience</cc-tab>
            <cc-tab type="line">Documents</cc-tab>
          </div>`,
      },
      {
        slug: 'pagination',
        hint: 'Step through 12 pages',
        name: 'Pagination',
        tag: 'cc-pagination',
        path: 'pagination.js',
        summary: 'Page navigation as a compact range or as numbered pages.',
        demo: `<cc-pagination aria-label="Results pages" type="numbers" data-total="120"></cc-pagination>`,
      },
      {
        slug: 'accordion',
        hint: 'Click to open',
        name: 'Accordion',
        tag: 'cc-accordion',
        path: 'accordion.js',
        summary: 'A disclosure section with heading and subtitle, in three sizes.',
        demo: `<cc-accordion heading="Can I use it with React?" subtitle="Framework support">Yes. React 19 supports custom elements natively, so no wrapper is needed.</cc-accordion>`,
      },
      {
        slug: 'list-item',
        hint: 'Select a row',
        name: 'List item',
        tag: 'cc-list-item',
        path: 'list-item.js',
        summary: 'A selectable row with an icon or checkbox, supporting text and a remove action.',
        demo: `<div role="list" class="list">
            <cc-list-item label="Design review" supporting-text="Tomorrow, 10:00" leading="icon" icon="event"></cc-list-item>
            <cc-list-item label="Ship 0.0.5" supporting-text="Friday" leading="checkbox" selected></cc-list-item>
          </div>`,
      },
    ],
  },
  {
    name: 'Overlays',
    code: 'OV',
    entries: [
      {
        slug: 'dialog',
        hint: 'Opens a modal',
        name: 'Dialog',
        tag: 'cc-dialog',
        path: 'dialog.js',
        summary: 'A modal dialog with heading, description and action buttons. Closes with Escape.',
        demo: `<cc-button data-open="dialog-demo">Invite teammate</cc-button>
          <cc-dialog id="dialog-demo" heading="Invite a teammate" description="They will get an email with a sign-in link.">
            <cc-text-input label="Email" placeholder="john.doe@example.com"></cc-text-input>
            <cc-button slot="actions" variant="text" color="secondary" data-close>Cancel</cc-button>
            <cc-button slot="actions" data-close>Send invite</cc-button>
          </cc-dialog>`,
      },
    ],
  },
];

export const entries = catalog.flatMap((g) => g.entries);
