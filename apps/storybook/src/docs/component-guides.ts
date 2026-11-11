/** Editorial guidance for package consumers; API types come from the manifest. */
export type ComponentGuide = {
  name: string;
  entry: string;
  summary: string;
  usage: string[];
  accessibility: string[];
  markup: string;
  javascript?: string;
  setup?: (root: HTMLElement) => void;
  related: string[];
  notes?: Record<string, string>;
};

export const guides: Record<string, ComponentGuide> = {
  'cc-button': {
    name: 'Button',
    entry: 'button',
    summary: 'Trigger an action, submit a form or confirm a decision.',
    usage: [
      'Use one filled button for the primary action in a group. Use outlined or text buttons for secondary actions and destructive color for irreversible actions.',
      'The default type is button. Set type="submit" inside a form to submit it, or type="reset" to restore its controls. Use Link for navigation, not a click handler that changes location.',
      'Use leading and trailing slots for decorative icons. The accent variant is intended for icon-only buttons.',
    ],
    accessibility: [
      'Give icon-only buttons an aria-label that names the action, such as “Add project”.',
      'Use a clear action label. A disabled button cannot be activated; explain elsewhere what is required to enable it.',
    ],
    markup:
      '<cc-button>Save changes</cc-button>\n<cc-button variant="outlined" color="secondary">Cancel</cc-button>\n<cc-button variant="text" color="destructive">Delete project</cc-button>',
    related: ['Link', 'Dialog'],
  },
  'cc-accordion': {
    name: 'Accordion',
    entry: 'accordion',
    summary: 'Reveal supporting information without leaving the current page.',
    usage: [
      'Put the section label in heading and the expandable content in the default slot. Add subtitle only when it helps distinguish the section.',
      'Each accordion owns its open state independently. Set the open property when the application needs to expand a section; this is not an exclusive accordion group.',
      'Do not hide information required to complete the current task.',
    ],
    accessibility: [
      'The header uses native details/summary semantics and supports keyboard activation.',
      'Keep headings descriptive. Avoid placing another button or link inside the summary label.',
    ],
    markup:
      '<cc-accordion heading="Delivery information" subtitle="Shipping and tracking">\n  Orders ship within two business days. We will email your tracking link.\n</cc-accordion>',
    related: ['Tab', 'Dialog'],
  },
  'cc-alert': {
    name: 'Alert',
    entry: 'alert',
    summary: 'Explain the result of an action or surface information that needs attention.',
    usage: [
      'Choose status for meaning, not decoration: success for completion, error for failure, warning for risk and info for neutral guidance.',
      'Place a short title in the title slot and useful next steps in the default slot. Use the action slot for a recovery action.',
      'With dismissible, the close button emits a cancelable cc-close event. Call preventDefault() if the alert should stay visible.',
    ],
    accessibility: [
      'Do not rely on status color alone. State the outcome and any next action in text.',
      'Keep alerts concise and avoid repeatedly inserting alerts while the user types. Localize close-label when needed.',
    ],
    markup:
      '<cc-alert status="success" dismissible>\n  <span slot="title">Project saved</span>\n  Your team can now see the updated project details.\n</cc-alert>',
    related: ['Badge', 'Dialog'],
  },
  'cc-avatar': {
    name: 'Avatar',
    entry: 'avatar',
    summary: 'Represent a person with a profile image or the built-in fallback icon.',
    usage: [
      'Set src to an image URL and alt to the person’s name. Missing or failed images use the fallback icon; arbitrary initials are not a supported slot.',
      'Use notification-badge for a notification indicator. Large avatars accept a count in the badge slot; small and medium avatars display a dot.',
      'An avatar is not interactive. Put profile navigation in a separate link.',
    ],
    accessibility: [
      'The host has image semantics. Always provide meaningful alt text rather than relying on the generic “Avatar” label.',
      'Explain notification counts in surrounding text when they convey information the user needs.',
    ],
    markup: '<cc-avatar alt="Morgan Lee" size="large" notification-badge>\n  <span slot="badge">3</span>\n</cc-avatar>',
    related: ['Badge', 'List item'],
  },
  'cc-badge': {
    name: 'Badge',
    entry: 'badge',
    summary: 'Show a status, category or count next to the item it describes.',
    usage: [
      'Badges are non-interactive. Use a Chip for an interactive filter or removable selection.',
      'Use text for a status, number for a count, and dot for a compact indicator. Dot content is visually hidden but remains available to assistive technology.',
      'Text badges are designed in medium size; the small size applies to number and dot badges.',
    ],
    accessibility: [
      'Use explicit status text such as “In review”, not color alone.',
      'Keep counts close to their label so “4” has context. Give dot badges meaningful text content.',
    ],
    markup:
      '<cc-badge color="blue" variant="subtle">In review</cc-badge>\n<cc-badge color="green" type="dot">Available</cc-badge>',
    related: ['Chip', 'Alert'],
  },
  'cc-checkbox': {
    name: 'Checkbox',
    entry: 'checkbox',
    summary: 'Let people select any number of independent options.',
    usage: [
      'Put the visible label in the default slot. Give each form control a name and a value; only checked checkboxes contribute a value to FormData.',
      'Read the live checked property in input or change handlers. The checked attribute is not a reliable way to read current user state.',
      'For one choice from a set, use a Radio group instead. For an immediate on/off preference, use a Switch.',
    ],
    accessibility: [
      'Provide visible label text, or aria-label if there is genuinely no visible label.',
      'Group related choices with a fieldset and legend. Space toggles the focused checkbox.',
    ],
    markup: '<cc-checkbox name="updates" value="email" checked>Email me project updates</cc-checkbox>',
    javascript:
      "const checkbox = document.querySelector('cc-checkbox');\ncheckbox.addEventListener('change', () => {\n  console.log(checkbox.checked);\n});",
    related: ['Radio', 'Switch'],
  },
  'cc-chip': {
    name: 'Chip',
    entry: 'chip',
    summary: 'Toggle a filter or represent a removable selection.',
    usage: [
      'Use type="filter" for toggled filters; the component updates selected and emits change.',
      'Use type="input" removable for selected values. The remove event is a request: your application must remove the chip or update its data.',
      'Use the avatar slot for an input chip avatar; use leading or trailing for decorative icons. A selected filter shows a check instead of its leading icon.',
    ],
    accessibility: [
      'Use a concise visible label that makes sense in its surrounding group.',
      'Removable input chips support Delete and Backspace. Move focus to a sensible neighbor when removing a focused chip in your application.',
    ],
    markup: '<cc-chip type="filter">Assigned to me</cc-chip>\n<cc-chip type="input" removable>Design team</cc-chip>',
    javascript:
      "const chip = document.querySelector('cc-chip[type=\"input\"]');\nchip.addEventListener('remove', () => chip.remove());",
    setup(root) {
      const chip = root.querySelector('cc-chip[type="input"]');
      chip?.addEventListener('remove', () => chip.remove());
    },
    related: ['Badge', 'Text input'],
  },
  'cc-dialog': {
    name: 'Dialog',
    entry: 'dialog',
    summary: 'Ask for a focused decision while keeping the current page in context.',
    usage: [
      'Set open to true to show the native modal dialog. Set it to false to close. Put action buttons in slot="actions".',
      'Listen for close to synchronize application state, including when Escape dismisses the dialog. Action buttons do not close it automatically.',
      'Use dialogs for decisions that interrupt the current flow. Prefer inline content for routine editing.',
    ],
    accessibility: [
      'Supply heading, or aria-label when there is no visible heading.',
      'Native modal behavior contains focus and makes the background inert. Test the trigger, initial focus, Escape dismissal and focus return in your application.',
    ],
    markup:
      '<cc-button id="open-dialog">Review changes</cc-button>\n<cc-dialog heading="Ready to publish?" description="Your team will see these changes immediately.">\n  <cc-button slot="actions" id="close-dialog">Keep editing</cc-button>\n</cc-dialog>',
    javascript:
      "const dialog = document.querySelector('cc-dialog');\ndocument.querySelector('#open-dialog').addEventListener('click', () => {\n  dialog.open = true;\n});\ndocument.querySelector('#close-dialog').addEventListener('click', () => {\n  dialog.open = false;\n});",
    setup(root) {
      const dialog = root.querySelector('cc-dialog')!;
      root.querySelector('#open-dialog')!.addEventListener('click', () => {
        dialog.open = true;
      });
      root.querySelector('#close-dialog')!.addEventListener('click', () => {
        dialog.open = false;
      });
    },
    related: ['Button', 'Alert'],
  },
  'cc-link': {
    name: 'Link',
    entry: 'link',
    summary: 'Navigate to a page, document or external destination.',
    usage: [
      'Set href for navigation and use meaningful destination text. Use a Button for actions that do not navigate.',
      'For a new tab, set target="_blank" and rel="noopener noreferrer". Tell people when leaving the current context would be surprising.',
      'Use hide-icon for a text-only link or the leading slot to replace its icon.',
    ],
    accessibility: [
      'Describe the destination rather than using “click here”.',
      'Disabled links cannot be activated. Explain why a destination is unavailable if it is important to the task.',
    ],
    markup:
      '<cc-link href="https://github.com/codechem/system" target="_blank" rel="noopener noreferrer">\n  View the source on GitHub\n</cc-link>',
    related: ['Button', 'Navigation drawer'],
  },
  'cc-list-item': {
    name: 'List item',
    entry: 'list-item',
    summary: 'Display a labeled row with optional supporting text and selection.',
    usage: [
      'Put items in a container with role="list". Set label and supporting-text rather than passing arbitrary default-slot content.',
      'The remove button is visible by default. Add hide-remove-button for a read-only list. The remove event does not automatically remove the item.',
      'Use leading="checkbox" for selection and read selected after change. Use leading="icon" and icon for a decorative Material icon.',
    ],
    accessibility: [
      'The host exposes listitem semantics; provide the list container.',
      'Use distinct labels so selection and removal actions have clear context. Manage focus after removing a row.',
    ],
    markup:
      '<div role="list" aria-label="Project files">\n  <cc-list-item label="Project brief" supporting-text="Updated today" leading="icon" icon="description" hide-remove-button></cc-list-item>\n  <cc-list-item label="Research notes" supporting-text="Updated yesterday" leading="icon" icon="description" hide-remove-button></cc-list-item>\n</div>',
    related: ['Checkbox', 'Avatar'],
  },
  'cc-navigation-drawer': {
    name: 'Navigation drawer',
    entry: 'navigation-drawer',
    summary: 'Organize application destinations in an expandable navigation rail.',
    usage: [
      'Assign items as a JavaScript property, not a JSON attribute. Each item has label and icon, with optional href, selected and children.',
      'Both links and button items emit select; event.detail is the activated item. Items with href also navigate natively. Ignore linked items in your application routing handler to avoid routing twice.',
      'The drawer manages its expanded groups and collapse control. Use collapsed for a compact rail; supply full and compact branding in logo and logomark slots.',
    ],
    accessibility: [
      'Set aria-label to distinguish this navigation landmark from other navigation on the page.',
      'Use meaningful destination labels. Selected leaf items expose aria-current="page".',
    ],
    markup: '<cc-navigation-drawer aria-label="Workspace"></cc-navigation-drawer>',
    javascript:
      "const drawer = document.querySelector('cc-navigation-drawer');\ndrawer.items = [\n  { label: 'Projects', icon: 'folder', selected: true },\n  { label: 'Team', icon: 'group' },\n];\ndrawer.addEventListener('select', (event) => {\n  if (event.detail.href !== undefined) return; // Let native links navigate.\n  console.log(event.detail.label); // Route button items in your application.\n});",
    setup(root) {
      root.querySelector('cc-navigation-drawer')!.items = [
        { label: 'Projects', icon: 'folder', selected: true },
        { label: 'Team', icon: 'group' },
      ];
    },
    related: ['Link', 'Tab'],
    notes: { items: 'JavaScript property only. Array of { label, icon, href?, selected?, children? }.' },
  },
  'cc-number-input-stepper': {
    name: 'Number input stepper',
    entry: 'number-input-stepper',
    summary: 'Enter a numeric value by typing or stepping within a range.',
    usage: [
      'Set min, max and step for the allowed range. value is a string; convert explicitly and handle an empty value before using it as a number.',
      'Set name for form submission. Listen for input for live edits or change for committed edits and step actions.',
      'Use checkValidity() or reportValidity() to inspect the native number constraints.',
    ],
    accessibility: [
      'Provide aria-label; this component has no built-in visible label attribute. Add visible explanatory text nearby.',
      'Use sensible bounds and explain the expected unit, such as seats or hours.',
    ],
    markup:
      '<cc-number-input-stepper aria-label="Number of seats" name="seats" value="5" min="1" max="50" step="1"></cc-number-input-stepper>',
    related: ['Text input', 'Calendar'],
  },
  'cc-pagination': {
    name: 'Pagination',
    entry: 'pagination',
    summary: 'Move through a collection one page at a time.',
    usage: [
      'total is the number of items, not the number of pages. page is one-based and pageSize controls how many items belong to each page.',
      'The component updates page and emits change. Your application must fetch or slice the data and update the visible results.',
      'Set numeric properties from JavaScript or use the page, total and page-size attributes. Use type="numbers" for compact numeric presentation.',
    ],
    accessibility: [
      'Give the navigation an aria-label that identifies the collection.',
      'After loading results, announce the updated range without unexpectedly moving keyboard focus.',
    ],
    markup: '<cc-pagination aria-label="Project pages" total="86" page-size="10" page="1"></cc-pagination>',
    javascript:
      "const pagination = document.querySelector('cc-pagination');\npagination.addEventListener('change', () => {\n  console.log({ page: pagination.page, pageSize: pagination.pageSize });\n  // Load this page of results in your application.\n});",
    related: ['List item', 'Search bar'],
    notes: {
      total: 'Total item count, not page count.',
      page: 'Current page, starting at 1.',
      pageSize: 'Number of items per page.',
    },
  },
  'cc-radio-group': {
    name: 'Radio',
    entry: 'radio',
    summary: 'Choose exactly one option from a related set.',
    usage: [
      'Import radio.js to register both cc-radio-group and cc-radio. Put options in the group’s default slot and give each a distinct value.',
      'Set name on the group for form submission. Read group.value after input or change; do not read a child’s checked attribute as application state.',
      'Use a Checkbox when multiple selections are allowed.',
    ],
    accessibility: [
      'Give the group an aria-label or aria-labelledby pointing to a visible group heading.',
      'Radio groups manage arrow-key selection and roving focus. Keep option labels visible and concise.',
    ],
    markup:
      '<cc-radio-group name="visibility" value="team" aria-label="Project visibility">\n  <cc-radio value="team">Team only</cc-radio>\n  <cc-radio value="company">Everyone in the company</cc-radio>\n</cc-radio-group>',
    related: ['Checkbox', 'Switch'],
  },
  'cc-search-bar': {
    name: 'Search bar',
    entry: 'search-bar',
    summary: 'Collect a search query for a list or a page of results.',
    usage: [
      'Read value on input for live filtering, or change when the user commits an edit. Debounce network requests in the application.',
      'Set name to include the query in a form. The component does not fetch results or provide suggestions.',
      'Replace icons with the leading and trailing slots; hide-trailing-icon removes the default search icon.',
    ],
    accessibility: [
      'Set aria-label even when placeholder text is present. Placeholder text is not a persistent accessible label.',
      'Announce updated result counts in a nearby live region when implementing live search.',
    ],
    markup: '<cc-search-bar aria-label="Search projects" name="query" placeholder="Search projects"></cc-search-bar>',
    javascript:
      "const search = document.querySelector('cc-search-bar');\nsearch.addEventListener('input', () => {\n  console.log(search.value);\n});",
    related: ['Text input', 'Pagination'],
  },
  'cc-switch': {
    name: 'Switch',
    entry: 'switch',
    summary: 'Turn a setting on or off.',
    usage: [
      'Use a switch for a binary setting, preferably applied immediately. Use a Checkbox for selecting options submitted together.',
      'Read checked after change or input. When used in a form, set name and value; unchecked switches contribute no form entry.',
      'Boolean attributes are presence-based: checked="false" is still checked. Remove the attribute or assign checked = false.',
    ],
    accessibility: [
      'Use a stable label such as “Email notifications”, not a label that changes between “Enable” and “Disable”.',
      'Provide visible slot text or aria-label. The switch supports keyboard activation.',
    ],
    markup: '<cc-switch name="notifications" value="email" checked>Email notifications</cc-switch>',
    related: ['Checkbox', 'Radio'],
  },
  'cc-tab': {
    name: 'Tab',
    entry: 'tab',
    summary: 'Present a tab control for switching between related views.',
    usage: [
      'This is a tab primitive, not a complete tabs controller. Your application owns selected state, panel visibility and keyboard navigation.',
      'Place tabs in role="tablist". On activation, update selected and show the corresponding panel. Disabled tabs must be excluded from navigation.',
      'Use enclosed for a bordered active tab or line for an underline. Do not use tabs as links to unrelated pages.',
    ],
    accessibility: [
      'Before shipping a tab interface, wire tab/panel relationships and Arrow, Home and End behavior. The component alone does not implement the full tabs pattern.',
      'Test focus and selection with assistive technology. Use links when your application cannot provide a complete tabs interaction.',
    ],
    markup:
      '<div role="tablist" aria-label="Project views">\n  <cc-tab selected>Overview</cc-tab>\n  <cc-tab>Activity</cc-tab>\n</div>\n<p>These controls demonstrate styling only; the application owns panel switching.</p>',
    related: ['Navigation drawer', 'Accordion'],
  },
  'cc-text-input': {
    name: 'Text input',
    entry: 'text-input',
    summary: 'Collect a single line of text with a label and validation guidance.',
    usage: [
      'Set label for a visible label and name for form submission. supporting-text explains the expected value; error displays a validation message.',
      'Read value after input for live edits or change for committed edits. Set error after validating in the application, and clear it when the problem is resolved.',
      'This component is a text field, not a generic input-type wrapper. There is no public type="email" or type="password" API. Use native inputs for unsupported types.',
    ],
    accessibility: [
      'Do not replace a label with placeholder text. Explain errors with a concrete correction.',
      'required participates in validity checks. An error string also marks the field invalid. Test form validation and error announcements in context.',
    ],
    markup:
      '<cc-text-input label="Project name" name="project" supporting-text="Use a name your team will recognize." required></cc-text-input>',
    related: ['Text area', 'Search bar', 'Chip'],
  },
  'cc-textarea': {
    name: 'Text area',
    entry: 'textarea',
    summary: 'Collect a longer response, description or note.',
    usage: [
      'Use label for the visible label, supporting-text for guidance and name for form submission.',
      'Read value after input or change. Set required when an empty response should block form submission.',
      'Use a Text input for a short, single-line value. There is no public rows or maxlength API; do not assume native textarea attributes are forwarded.',
    ],
    accessibility: [
      'Ask a specific question in the label and describe expected content in supporting text.',
      'Provide aria-label when intentionally omitting the visible label. Do not rely on placeholder text alone.',
    ],
    markup:
      '<cc-textarea label="Project description" name="description" supporting-text="Summarize the problem this project solves." required></cc-textarea>',
    related: ['Text input', 'Button'],
  },
  'cc-tooltip': {
    name: 'Tooltip',
    entry: 'tooltip',
    summary: 'Add a short, non-essential explanation to a focusable control.',
    usage: [
      'Give the trigger a unique id and set for to that id. Keep the tooltip and trigger in the same document or shadow root.',
      'The tooltip appears on pointer hover and keyboard focus. placement chooses the preferred side.',
      'Do not put buttons or links in a tooltip, and do not hide essential instructions there.',
    ],
    accessibility: [
      'A tooltip describes a trigger; it does not replace its accessible name. Icon buttons still need aria-label.',
      'Ensure the trigger can receive keyboard focus. Use visible helper text for information everyone needs.',
    ],
    markup:
      '<cc-button id="archive-project" variant="outlined">Archive project</cc-button>\n<cc-tooltip for="archive-project" placement="bottom">Archived projects remain available in search.</cc-tooltip>',
    related: ['Button', 'Text input'],
  },
  'cc-calendar': {
    name: 'Calendar',
    entry: 'calendar',
    summary: 'Choose and confirm a date within an optional range.',
    usage: [
      'Use YYYY-MM-DD strings for value, min and max. locale controls the displayed month and weekday labels.',
      'Picking a day updates the draft date and emits input. Pressing Done commits value and emits change. Read value after change, not input, for the confirmed date.',
      'The calendar participates in form association, but has no public name property. If you need native FormData, mirror its committed value into a named hidden input in your application.',
    ],
    accessibility: [
      'Provide visible context for what date is being chosen. Arrow keys move between days; test min/max constraints and keyboard navigation.',
      'Allow enough room for the calendar grid. Avoid placing it in a narrow inline toolbar.',
    ],
    markup: '<cc-calendar value="2026-11-18" min="2026-11-01" max="2026-12-31" locale="en-GB"></cc-calendar>',
    javascript:
      "const calendar = document.querySelector('cc-calendar');\ncalendar.addEventListener('change', () => {\n  console.log(calendar.value); // Confirmed YYYY-MM-DD date\n});",
    related: ['Number input stepper', 'Text input'],
  },
};
