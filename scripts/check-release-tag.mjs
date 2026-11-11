import { appendFileSync } from 'node:fs';
import { isStableReleaseTag } from './release-notes.mjs';

// Emit only a boolean, never tag metadata, into the Actions output protocol.
appendFileSync(process.env.GITHUB_OUTPUT, `stable=${isStableReleaseTag(process.env.RELEASE_TAG)}\n`);
