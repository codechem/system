# Project agent setup

- OpenCode: configure the Superpowers plugin in `opencode.json`; install the
  Impeccable skill and command in `.opencode/` with V2 skill-call syntax.
- Claude Code: declare the Superpowers marketplace and enabled plugin in
  `.claude/settings.json`; install Impeccable's skill, agents, and design hooks.
- Share existing repository guidance through `AGENTS.md -> CLAUDE.md`.
- Ignore downloaded platform engines and Claude's per-machine settings.

## Verification and review

- Check JSON configuration, installed skill references, and engine probes.
- Confirm the relative guidance symlink resolves to the existing file.
- Preserve existing repository guidance and unrelated working-tree edits.
- Claude Code is not on PATH; plugin loading must be checked in Claude Code.
  Install `superpowers@superpowers-marketplace` if prompted, using project scope.
