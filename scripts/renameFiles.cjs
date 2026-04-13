const fs = require("fs").promises;
const path = require("path");

function sanitizeComponent(s) {
  if (!s) return s;
  // 移除 Windows/Unix 不允许或不便的字符： / \ : * ? " < > |
  // 保留中文标点（例如全角冒号）
  return s
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function processEntries(entries, dir) {
  let changed = 0;
  for (const entry of entries) {
    const oldFile = entry.file;
    const round =
      entry.round != null ? String(entry.round).padStart(2, "0") : null;
    const oldPath = path.join(__dirname, "..", "public", dir, oldFile);
    if (!(await fileExists(oldPath))) {
      // try case-insensitive search fallback
      try {
        const files = await fs.readdir(
          path.join(__dirname, "..", "public", dir),
        );
        const match = files.find(
          (f) => f.toLowerCase() === (oldFile || "").toLowerCase(),
        );
        if (match) {
          // update oldPath
          oldPath = path.join(__dirname, "..", "public", dir, match);
        }
      } catch (e) {}
    }

    if (!(await fileExists(oldPath))) {
      console.warn("file not found, skip:", oldPath);
      continue;
    }

    const content = await fs.readFile(oldPath, "utf8");
    const h1 = (content.match(/^#\s*(.+)$/m) || [null, null])[1];
    const title =
      (h1 && h1.trim()) || entry.title || path.basename(oldFile, ".md");
    const safe = sanitizeComponent(title);
    if (!round) {
      console.warn("no round for entry, skip rename:", oldFile);
      entry.title = title;
      continue;
    }
    const newFilename = `${round}_${safe}.md`;
    const newPath = path.join(__dirname, "..", "public", dir, newFilename);

    if (path.basename(oldPath) !== newFilename) {
      // avoid overwriting existing file unintentionally
      if (await fileExists(newPath)) {
        console.warn("target exists, skip rename:", newPath);
      } else {
        await fs.rename(oldPath, newPath);
        console.log(
          "renamed",
          path.relative(process.cwd(), oldPath),
          "->",
          path.relative(process.cwd(), newPath),
        );
        changed++;
      }
    }

    entry.file = newFilename;
    entry.title = title;
  }
  return changed;
}

async function main() {
  const manifestPath = path.join(
    __dirname,
    "..",
    "public",
    "debate-manifest.json",
  );
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  let totalChanged = 0;
  if (Array.isArray(manifest.proArguments)) {
    totalChanged += await processEntries(manifest.proArguments, "正方");
  }
  if (Array.isArray(manifest.conArguments)) {
    totalChanged += await processEntries(manifest.conArguments, "反方");
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("manifest updated, total files renamed:", totalChanged);
}

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
