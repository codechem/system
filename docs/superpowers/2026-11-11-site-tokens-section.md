# Site: tokens section and 0.0.5

- **Tokens section on the frontpage.** A `.split` block between the theming band and the catalog introduces `@codechem/tokens` on its own: three facts, a copyable `npm i @codechem/tokens`, a CSS usage snippet and a link to the npm page. It reuses the page's existing `.split`, `.facts`, `.install` and `.code-dark` styles. The only new CSS is `justify-self: start` so the install button and link don't stretch in the grid.
- **Site now builds against 0.0.5.** `apps/site` depends on the published `@codechem/components` and `@codechem/tokens` at `0.0.5`. The header and hero pill read the version from the installed package, so they show `v0.0.5`.
- **0.0.5 is on the registry.** `npm view` lists it for both packages. The npmjs.com package page caches and can lag behind the registry.
