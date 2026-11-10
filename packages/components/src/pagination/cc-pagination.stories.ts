import { html } from 'lit';
import './cc-pagination.js';

const types = ['pages', 'numbers'] as const;

type Args = {
  type: (typeof types)[number];
  page: number;
  total: number;
  pageSize: number;
};

const pagination = (a: Args) =>
  html`<cc-pagination
    aria-label="Results pages"
    type=${a.type}
    .page=${a.page}
    .total=${a.total}
    .pageSize=${a.pageSize}
  ></cc-pagination>`;

export default {
  title: 'Components/Pagination',
  component: 'cc-pagination',
  tags: ['autodocs'],
  args: {
    type: 'pages',
    page: 1,
    total: 30,
    pageSize: 10,
  } satisfies Args,
  argTypes: {
    type: { control: 'inline-radio', options: types },
    page: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 0 } },
    pageSize: { control: { type: 'number', min: 1 } },
  },
  render: pagination,
};

export const Default = {};
export const Numbers = { args: { type: 'numbers' } };
export const MiddlePage = { args: { type: 'numbers', page: 15, total: 300 } };
export const LastPage = { args: { type: 'numbers', page: 3, total: 30 } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start">
    ${types.map((type) => pagination({ type, page: 1, total: 30, pageSize: 10 }))}
  </div>`,
};
