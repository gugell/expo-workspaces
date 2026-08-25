const PREFIX = '[expo-workspaces]';

export function reportChange(label: string, file: string): void {
  // eslint-disable-next-line no-console
  console.log(`${PREFIX} ${label} → ${file}`);
}

export function reportSkip(label: string, file: string): void {
  // eslint-disable-next-line no-console
  console.log(`${PREFIX} ${label} (unchanged) → ${file}`);
}

export function reportInfo(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`${PREFIX} ${message}`);
}

export function reportWarning(message: string): void {
  // eslint-disable-next-line no-console
  console.warn(`${PREFIX} warning: ${message}`);
}
