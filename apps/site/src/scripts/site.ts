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

const accentSteps: Record<string, string> = { light: '300', main: '600', dark: '800', shade: '900', transparent: 'opacity' };

for (const lab of document.querySelectorAll<HTMLElement>('[data-lab]')) {
  const stage = document.getElementById(lab.dataset.lab!)!;
  const radius = lab.querySelector<HTMLInputElement>('input[type="range"]')!;
  const swatches = lab.querySelectorAll<HTMLButtonElement>('.swatches button');
  const output = lab.querySelector<HTMLElement>('[data-css]');
  let palette = 'green';

  const apply = () => {
    const vars = Object.entries(accentSteps).map(([role, step]) => [`--cc-accent-${role}`, `var(--cc-palette-${palette}-${step})`]);
    vars.push(['--cc-radius', `${radius.value}px`]);
    for (const [name, value] of vars) stage.style.setProperty(name, value);
    lab.querySelector('.radius-value')!.textContent = `${radius.value}px`;
    swatches.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.palette === palette)));
    if (output) {
      output.textContent = `:root {\n${vars.map(([n, v]) => `  ${n}: ${v};`).join('\n')}\n}`;
      output.closest('.code')!.querySelector<HTMLElement>('[data-copy]')!.dataset.copy = output.textContent;
    }
  };

  swatches.forEach((b) =>
    b.addEventListener('click', () => {
      palette = b.dataset.palette!;
      apply();
    }),
  );
  radius.addEventListener('input', apply);
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
