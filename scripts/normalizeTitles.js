const fs = require("fs").promises;
const path = require("path");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (e.isFile() && full.toLowerCase().endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function extractAndRemoveTitle(content) {
  // 找到 ## 论据标题 下的一行作为论据标题
  const titleBlockRegex = /^##\s*论据标题\s*[\r\n]+([^\r\n]+)[\r\n]*/m;
  const m = content.match(titleBlockRegex);
  if (!m) return null;
  const title = m[1].trim();
  const cleaned = content.replace(titleBlockRegex, "");
  return { title, cleaned };
}

async function processFile(file) {
  let content = await fs.readFile(file, "utf8");
  const res = extractAndRemoveTitle(content);
  if (!res) return false;
  let { title, cleaned } = res;

  // 如果存在 YAML frontmatter，插到 frontmatter 之后
  const fmMatch = cleaned.match(/^(---[\s\S]*?---\s*)/);
  if (fmMatch) {
    const fm = fmMatch[1];
    // 如果 frontmatter 后面已经有 H1，则替换第一处 H1
    const afterFm = cleaned.slice(fm.length);
    const h1Regex = /^#\s.*$/m;
    if (h1Regex.test(afterFm)) {
      const replaced = afterFm.replace(h1Regex, "# " + title);
      cleaned = fm + replaced;
    } else {
      cleaned = fm + "# " + title + "\n\n" + afterFm;
    }
  } else {
    // 没有 frontmatter，寻找第一个 H1 替换，否则在顶部插入
    const h1Regex = /^#\s.*$/m;
    if (h1Regex.test(cleaned)) {
      cleaned = cleaned.replace(h1Regex, "# " + title);
    } else {
      cleaned = "# " + title + "\n\n" + cleaned;
    }
  }

  if (cleaned !== content) {
    await fs.writeFile(file, cleaned, "utf8");
    return true;
  }
  return false;
}

async function main() {
  const base = path.join(__dirname, "..", "public");
  try {
    const files = await walk(base);
    let changed = 0;
    for (const f of files) {
      const ok = await processFile(f);
      if (ok) {
        console.log("updated", path.relative(process.cwd(), f));
        changed++;
      }
    }
    console.log("done. files changed:", changed);
  } catch (e) {
    console.error("error", e);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
