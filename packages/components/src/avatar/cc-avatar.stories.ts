import { html, nothing } from 'lit';
import './cc-avatar.js';

const sizes = ['large', 'medium', 'small'] as const;

const portrait =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#4a5568"/><circle cx="24" cy="19" r="8" fill="#e2e8f0"/><path d="M8 48c2-11 9-16 16-16s14 5 16 16z" fill="#e2e8f0"/></svg>',
  );

type Args = {
  size: (typeof sizes)[number];
  src: string;
  alt: string;
  notificationBadge: boolean;
  badgeCount: string;
};

const avatar = (a: Args) =>
  html`<cc-avatar
    size=${a.size}
    src=${a.src || nothing}
    alt=${a.alt || nothing}
    ?notification-badge=${a.notificationBadge}
    >${a.notificationBadge
      ? html`<span slot="badge">${a.size === 'large' ? a.badgeCount : nothing}</span>`
      : nothing}</cc-avatar
  >`;

export default {
  title: 'Components/Avatar',
  component: 'cc-avatar',
  tags: ['autodocs'],
  args: { size: 'medium', src: '', alt: 'John Doe', notificationBadge: false, badgeCount: '1' } satisfies Args,
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    src: { control: 'text' },
    alt: { control: 'text' },
    notificationBadge: { control: 'boolean' },
    badgeCount: { control: 'text' },
  },
  render: avatar,
};

export const Icon = {};
export const Image = { args: { src: portrait, alt: 'John Doe' } };
export const WithCount = { args: { size: 'large', notificationBadge: true, badgeCount: '1' } };
export const WithDot = { args: { size: 'medium', notificationBadge: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(4, auto); gap: 24px 32px; align-items: center; justify-items: center; width: max-content">
    ${sizes.map((size) => [
      avatar({ size, src: '', alt: 'John Doe', notificationBadge: true, badgeCount: '1' }),
      avatar({ size, src: '', alt: 'John Doe', notificationBadge: false, badgeCount: '1' }),
      avatar({ size, src: portrait, alt: 'John Doe', notificationBadge: true, badgeCount: '1' }),
      avatar({ size, src: portrait, alt: 'John Doe', notificationBadge: false, badgeCount: '1' }),
    ])}
  </div>`,
};
