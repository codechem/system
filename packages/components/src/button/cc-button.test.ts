import { afterEach, describe, expect, it, vi } from 'vitest';
import '@codechem/tokens/tokens.css';
import './cc-button.js';
import type { CcButton } from './cc-button.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const buttons = [...document.querySelectorAll('cc-button')];
  await Promise.all(buttons.map((b) => b.updateComplete));
  return buttons;
}

const inner = (b: CcButton) => b.shadowRoot!.querySelector('button')!;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-button', () => {
  it('has Figma defaults', async () => {
    const [b] = await render('<cc-button>Save</cc-button>');
    expect(b.getAttribute('variant')).toBe('filled');
    expect(b.getAttribute('color')).toBe('primary');
    expect(b.getAttribute('size')).toBe('medium');
    expect(b.type).toBe('button');
  });

  it('does not reach click listeners when disabled', async () => {
    const [b] = await render('<cc-button disabled>Save</cc-button>');
    const onClick = vi.fn();
    b.addEventListener('click', onClick);
    b.click();
    inner(b).click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reaches click listeners when enabled', async () => {
    const [b] = await render('<cc-button>Save</cc-button>');
    const onClick = vi.fn();
    b.addEventListener('click', onClick);
    inner(b).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('in a form', () => {
    const form = (button: string) => `<form><input name="name" value="John Doe" required />${button}</form>`;
    const onSubmit = () => {
      const spy = vi.fn((e: Event) => e.preventDefault());
      document.querySelector('form')!.addEventListener('submit', spy);
      return spy;
    };

    it('submits with type="submit"', async () => {
      const [b] = await render(form('<cc-button type="submit">Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).toHaveBeenCalledOnce();
    });

    it('does not submit by default', async () => {
      const [b] = await render(form('<cc-button>Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('does not submit when disabled', async () => {
      const [b] = await render(form('<cc-button type="submit" disabled>Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('does not submit when a required field is empty', async () => {
      const [b] = await render(form('<cc-button type="submit">Send</cc-button>'));
      const submit = onSubmit();
      document.querySelector('input')!.value = '';
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('resets with type="reset"', async () => {
      const [b] = await render(form('<cc-button type="reset">Reset</cc-button>'));
      const input = document.querySelector('input')!;
      input.value = 'changed';
      inner(b).click();
      expect(input.value).toBe('John Doe');
    });
  });

  it.each([
    ['small', 28],
    ['medium', 40],
    ['large', 48],
  ])('size=%s is %ipx tall, like Figma', async (size, height) => {
    const [b] = await render(`<cc-button size="${size}">Button</cc-button>`);
    expect(inner(b).getBoundingClientRect().height).toBe(height);
  });
});
