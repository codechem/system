---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

we need a proper frontpage for our codechem design system, something people land on before they go to the docs. it should show off the components and feel like our brand (the green). not crowded please, and it needs real navigation. Use our published component library exactly as an app would: it is installed at apps/site/node_modules/@codechem/components (version 0.0.4; read its custom-elements.json for the API) with its tokens at apps/site/node_modules/@codechem/tokens/dist/tokens.css. Write plain files only: index.html, main.js (start it with `import '@codechem/components';`) and style.css, into the output folder you are given. Do not change any existing file in the repo.
