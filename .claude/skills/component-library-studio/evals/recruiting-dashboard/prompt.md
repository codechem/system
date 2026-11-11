---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Build me a recruiting dashboard screen: a few headline numbers (open roles, candidates in pipeline, interviews this week, offers out), a list of candidates with their stage and pagination, recent activity, and a way to filter by department. It's for 3RM, so use our design tokens and @codechem components. Use our published component library exactly as an app would: it is installed at apps/site/node_modules/@codechem/components (version 0.0.4; read its custom-elements.json for the API) with its tokens at apps/site/node_modules/@codechem/tokens/dist/tokens.css. Write plain files only: index.html, main.js (start it with `import '@codechem/components';`) and style.css, into the output folder you are given. Do not change any existing file in the repo.
