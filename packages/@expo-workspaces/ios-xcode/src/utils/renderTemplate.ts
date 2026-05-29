import fs from 'fs';
import path from 'path';

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES_ROOT = path.join(PACKAGE_ROOT, 'templates');

const PLACEHOLDER_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

export function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface RenderTemplateOptions {
  rawKeys?: string[];
}

export function renderTemplate(
  templateRelativePath: string,
  variables: Record<string, string>,
  options: RenderTemplateOptions = {},
): string {
  const templatePath = path.join(TEMPLATES_ROOT, templateRelativePath);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateRelativePath}`);
  }
  const rawKeySet = new Set(options.rawKeys ?? []);
  let content = fs.readFileSync(templatePath, 'utf8');

  for (const [key, rawValue] of Object.entries(variables)) {
    const token = `{{${key}}}`;
    const safeValue = rawKeySet.has(key) ? rawValue : escapeXmlAttribute(rawValue);
    content = content.split(token).join(safeValue);
  }

  const unresolved = [...content.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[1]);
  if (unresolved.length > 0) {
    const unique = [...new Set(unresolved)];
    throw new Error(`Unresolved placeholders in ${templateRelativePath}: ${unique.join(', ')}`);
  }
  return content;
}

export function renderFragment(
  fragmentRelativePath: string,
  variables: Record<string, string>,
  options: RenderTemplateOptions = {},
): string {
  return renderTemplate(path.join('fragments', fragmentRelativePath), variables, options);
}
