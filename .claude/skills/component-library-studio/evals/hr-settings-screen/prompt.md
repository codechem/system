---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Can you lay out the account settings screen for 3RM (our internal HR app)? The user should be able to edit their profile (name, email, job title, bio), choose which notifications they get, and manage security (2FA, sign out of other sessions). Use our cc components and tokens so it looks like the rest of the app. Use our published component library exactly as an app would: it is installed at apps/site/node_modules/@codechem/components (version 0.0.4; read its custom-elements.json for the API) with its tokens at apps/site/node_modules/@codechem/tokens/dist/tokens.css. Write plain files only: index.html, main.js (start it with `import '@codechem/components';`) and style.css, into the output folder you are given. Do not change any existing file in the repo.
