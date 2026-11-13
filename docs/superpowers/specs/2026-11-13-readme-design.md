# Developer-first README

## Intent

Make the root README a useful entry point for developers evaluating and adopting CodeChem's UI components, rather than an internal operations manual.

## Approved approach

Use a quick-start README: preview, clear description, site and Storybook links, installation, one copyable usage example, brief token/font and theming guidance, contribution instructions, and MIT license. The user selected this over a full usage guide because the project already has a site and Storybook.

## Constraints and non-goals

- Preserve useful contributor and maintainer material in separate documentation.
- Do not duplicate the component catalog or framework guides.
- Do not invent marketing, accessibility, compatibility, or stability claims.
- Do not change component code or unrelated existing work.
- Correct the contradictory font guidance using the current bundled-font implementation.

## Builder decisions

Put contributor setup and development instructions in `docs/CONTRIBUTING.md`; put release and deployment operations in `docs/MAINTAINING.md`. Keep their relative links valid after moving them. Use the existing preview and the site/Storybook URLs configured by the project.

## Verification

User follow-up: add a compact, linked badge row for the npm version, MIT license, Web Components, and Lit.

Check local Markdown links, examples against package exports and component APIs, command names against package scripts, preservation of operational sections, and whitespace errors.
