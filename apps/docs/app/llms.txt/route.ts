import { source } from "@/lib/source";

export const revalidate = false;

// biome-ignore lint/suspicious/useAwait: route handler requires async
export async function GET() {
  const lines: Array<string> = [];
  lines.push("# Documentation");
  lines.push("");
  for (const page of source.getPages()) {
    lines.push(`- [${page.data.title}](${page.url}): ${page.data.description}`);
  }
  return new Response(lines.join("\n"));
}
