/**
 * Escape special XML characters
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert a JavaScript value to plist XML element
 */
export function valueToXml(value: unknown, indent: string = '\t'): string {
  if (value === null || value === undefined) {
    return '<string></string>';
  }

  if (typeof value === 'boolean') {
    return value ? '<true/>' : '<false/>';
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return `<integer>${value}</integer>`;
    } else {
      return `<real>${value}</real>`;
    }
  }

  if (typeof value === 'string') {
    return `<string>${escapeXml(value)}</string>`;
  }

  // Handle Buffer as <data> (Base64 encoded)
  if (Buffer.isBuffer(value)) {
    const base64 = value.toString('base64');
    return `<data>${base64}</data>`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '<array/>';
    }
    const items: string[] = ['<array>'];
    for (const item of value) {
      // For array of dicts (like urlFilterRules), sort dict keys
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        items.push(`${indent}\t${dictToXml(item as Record<string, unknown>, `${indent}\t`)}`);
      } else {
        items.push(`${indent}\t${valueToXml(item, `${indent}\t`)}`);
      }
    }
    items.push(`${indent}</array>`);
    return items.join('\n');
  }

  if (typeof value === 'object') {
    return dictToXml(value as Record<string, unknown>, indent);
  }

  return '<string></string>';
}

/**
 * Convert a dictionary/object to plist dict XML
 */
export function dictToXml(obj: Record<string, unknown>, indent: string = '\t'): string {
  const lines: string[] = ['<dict>'];

  // Sort keys alphabetically (required for Config Key generation)
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  for (const key of sortedKeys) {
    lines.push(`${indent}<key>${escapeXml(key)}</key>`);
    const valueXml = valueToXml(obj[key], indent);
    if (valueXml.includes('\n')) {
      lines.push(valueXml);
    } else {
      lines.push(`${indent}${valueXml}`);
    }
  }

  lines.push(`${indent.slice(0, -1)}</dict>`);
  return lines.join('\n');
}

/**
 * Convert JavaScript object to Apple plist XML format
 */
export function generatePlistXml(config: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
  lines.push('<plist version="1.0">');
  lines.push('<dict>');

  // Sort keys alphabetically (required for Config Key generation)
  const sortedKeys = Object.keys(config).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  for (const key of sortedKeys) {
    const value = config[key];
    lines.push(`\t<key>${escapeXml(key)}</key>`);
    lines.push(`\t${valueToXml(value)}`);
  }

  lines.push('</dict>');
  lines.push('</plist>');

  return lines.join('\n');
}
