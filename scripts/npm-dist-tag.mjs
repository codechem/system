const number = '(?:0|[1-9]\\d*)';
const prerelease = '(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)';
const versionPattern = new RegExp(`^${number}\\.${number}\\.${number}(?:-(${prerelease}(?:\\.${prerelease})*))?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

export function npmDistTag(version) {
  const match = typeof version === 'string' && version.trim() === version && versionPattern.exec(version);
  if (!match) throw new Error('Expected a valid package version');
  return match[1] ? 'next' : 'latest';
}
