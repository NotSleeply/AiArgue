import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });

export function renderMarkdown(content: string): string {
  return md.render(content || "");
}

export function extractArgumentTitleFromMarkdown(
  mdText: string,
): string | null {
  if (!mdText) return null;
  const match = mdText.match(/^##\s*论据标题\s*[\r\n]+([^\r\n]+)/m);
  if (match?.[1]?.trim()) return match[1].trim();
  const headingMatch = mdText.match(/^#\s*([^\r\n]+)/m);
  return headingMatch?.[1]?.trim() ?? null;
}
