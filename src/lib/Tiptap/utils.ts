export function trimTiptapContent(content: string) {
  return content
    .replace(/^(<p>\s*<\/p>)*/, '')
    .replace(/(<p>\s*<\/p>)*$/, '')
    .trim();
}
