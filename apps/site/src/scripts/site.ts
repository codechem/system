import '@codechem/components';

document.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;

  const copy = target.closest<HTMLElement>('[data-copy]');
  if (copy) {
    await navigator.clipboard?.writeText(copy.dataset.copy!);
    copy.dataset.copied = '';
    setTimeout(() => delete copy.dataset.copied, 1600);
  }

  const tab = target.closest('cc-tab');
  const list = tab?.closest('[role="tablist"]');
  if (tab && list && !tab.hasAttribute('disabled')) {
    list.querySelectorAll('cc-tab').forEach((t) => t.toggleAttribute('selected', t === tab));
    list.dispatchEvent(new CustomEvent('tab-select', { detail: tab.textContent!.trim() }));
  }

  const opener = target.closest<HTMLElement>('[data-open]');
  if (opener) document.getElementById(opener.dataset.open!)?.setAttribute('open', '');

  if (target.closest('[data-close]')) target.closest('cc-dialog')?.removeAttribute('open');
});

// Same --sx-* roles as the build-time Shiki theme (src/syntax.ts), for the live theme rule.
// Each line is its own block, and each value is unbreakable, so a long declaration wraps
// after its colon with a hanging indent.
const sx = (role: string, text: string) => `<span style="color: var(--sx-${role})">${text}</span>`;
const line = (html: string) => `<span class="ln">${html}\n</span>`;
const highlightTheme = (vars: string[][]) => {
  const value = (v: string) => {
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (ref) return `${sx('fn', 'var')}${sx('punct', '(')}${sx('tag', ref[1])}${sx('punct', ')')}`;
    const unit = v.match(/^(\d+)(\w*)$/);
    return unit ? sx('const', unit[1]) + sx('const', unit[2]) : v;
  };
  const body = vars.length
    ? vars.map(([n, v]) => line(`  ${sx('tag', n)}${sx('punct', ':')} <span class="val">${value(v)}${sx('punct', ';')}</span>`))
    : [line(`  ${sx('comment', '/* No overrides yet */')}`)];
  return [line(`${sx('attr', ':root')} ${sx('punct', '{')}`), ...body, `<span class="ln">${sx('punct', '}')}</span>`].join('');
};

const accentSteps: Record<string, string> = { light: '300', main: '600', dark: '800', shade: '900', transparent: 'opacity' };
const defaultPalette = 'green';
const title = (s: string) => s[0].toUpperCase() + s.slice(1);

for (const lab of document.querySelectorAll<HTMLElement>('[data-lab]')) {
  const stage = document.getElementById(lab.dataset.lab!)!;
  const radius = lab.querySelector<HTMLInputElement>('input[type="range"]')!;
  const group = lab.querySelector<HTMLElement>('.swatches')!;
  const swatches = [...group.querySelectorAll<HTMLButtonElement>('button')];
  const output = lab.querySelector<HTMLElement>('[data-css]');
  const copy = lab.querySelector<HTMLButtonElement>('[data-copy-theme]');
  const reset = lab.querySelector<HTMLButtonElement>('[data-reset]');
  const accentName = lab.querySelector('[data-accent-name]');
  const band = lab.closest<HTMLElement>('[data-tint]');
  let palette = defaultPalette;

  const apply = () => {
    const accent = Object.entries(accentSteps).map(([role, step]) => [`--cc-accent-${role}`, `var(--cc-palette-${palette}-${step})`]);
    const vars = [...accent, ['--cc-radius', `${radius.value}px`]];
    for (const [name, value] of vars) stage.style.setProperty(name, value);
    band?.style.setProperty('--tint', `var(--cc-palette-${palette}-800)`);
    lab.querySelector('.radius-value')!.textContent = `${radius.value}px`;
    if (accentName) accentName.textContent = title(palette);
    // Roving tabindex: the radio group is one tab stop, arrow keys move within it.
    swatches.forEach((b) => {
      const on = b.dataset.palette === palette;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (output) {
      // Only what differs from the tokens' defaults; an unchanged theme needs no CSS.
      const changed = [
        ...(palette === defaultPalette ? [] : accent),
        ...(radius.value === radius.defaultValue ? [] : [['--cc-radius', `${radius.value}px`]]),
      ];
      output.innerHTML = highlightTheme(changed);
      if (copy) {
        copy.dataset.copy = `:root {\n${changed.map(([n, v]) => `  ${n}: ${v};`).join('\n')}\n}`;
        copy.disabled = !changed.length;
      }
      if (reset) reset.disabled = !changed.length;
    }
  };

  const select = (b: HTMLButtonElement) => {
    palette = b.dataset.palette!;
    apply();
  };
  swatches.forEach((b) => b.addEventListener('click', () => select(b)));
  group.addEventListener('keydown', (e) => {
    const i = swatches.findIndex((b) => b.dataset.palette === palette);
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | undefined;
    if (e.key in step) next = (i + step[e.key] + swatches.length) % swatches.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = swatches.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    select(swatches[next]);
    swatches[next].focus();
  });
  radius.addEventListener('input', apply);
  reset?.addEventListener('click', () => {
    palette = defaultPalette;
    radius.value = radius.defaultValue;
    apply();
    swatches.find((b) => b.dataset.palette === palette)?.focus();
  });
  apply();
}

const frameworks = document.getElementById('framework-tabs');
frameworks?.addEventListener('tab-select', (e) => {
  const name = (e as CustomEvent<string>).detail;
  const box = frameworks.closest('.code')!;
  box.querySelectorAll<HTMLElement>('pre[data-framework]').forEach((pre) => {
    pre.hidden = pre.dataset.framework !== name;
    if (!pre.hidden) box.querySelector<HTMLElement>('.code-head [data-copy]')!.dataset.copy = pre.textContent!;
  });
});

document.querySelectorAll<HTMLElement & { page: number; total: number; pageSize: number }>('cc-pagination[data-total]').forEach((p) =>
  Object.assign(p, { page: 1, total: Number(p.dataset.total), pageSize: 10 }),
);
