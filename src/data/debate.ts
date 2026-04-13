// 辩论数据（自动从正方/反方目录同步加载）
import { ref } from "vue";

export interface Argument {
  title: string;
  content: string;
  source: string;
  time: string;
}

export interface DebateRound {
  round: number;
  positive: Argument;
  negative: Argument;
}

export const debateTitle = "AI是否应该取代人类？";
export const positiveName = "正方";
export const negativeName = "反方 ";
export const totalRounds = 60;

export const finalConclusion = {
  winner: "反方",
  winnerFull: "反方",
  summary: [
    "AI不应该取代人类作为文明主体",
    "人类在AI时代保持决策权、创造权和责任",
    "AI在标准化执行领域比人类做得更好",
    "AI的引入应伴随劳动者转型支持",
    "AI需要全球治理和监管框架",
    "效率不是唯一价值，责任、尊严、稳定同样重要",
    "技术进步不应等于人类退场",
  ],
};

// Helper: 去掉扩展名
const stripExt = (name: string) => name.replace(/\.[^/.]+$/, "");

function extractArgumentTitleFromMarkdown(md: string): string | null {
  const match = md.match(/^##\s*论据标题\s*[\r\n]+([^\r\n]+)/m);
  if (match?.[1]?.trim()) return match[1].trim();
  const headingMatch = md.match(/^#\s*([^\r\n]+)/m);
  return headingMatch?.[1]?.trim() ?? null;
}

// 简单的中文数字（1-99）到阿拉伯数字转换，能处理类似「三十七」「十一」等
function chineseToNumber(s: string): number {
  const map: Record<string, number> = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  s = s.replace(/\s+/g, "");
  if (!s) return NaN;
  if (s === "十") return 10;
  const tenIndex = s.indexOf("十");
  if (tenIndex !== -1) {
    const before = s.slice(0, tenIndex);
    const after = s.slice(tenIndex + 1);
    const tens = before ? (map[before] ?? Number(before)) : 1;
    let result = (tens || 1) * 10;
    if (after) result += map[after] ?? Number(after);
    return result;
  }
  // 纯数字或单字符
  if (s.length === 1) return map[s] ?? Number(s);
  // 多位阿拉伯数字字符串
  const maybeNum = Number(s);
  if (!Number.isNaN(maybeNum)) return maybeNum;
  // 逐字符累加（保守处理）
  let acc = 0;
  for (const ch of s) {
    const v = map[ch] ?? Number(ch);
    if (Number.isNaN(v)) return NaN;
    acc = acc * 10 + v;
  }
  return acc;
}

function extractRoundNumberFromFilename(name: string): number | null {
  const m = name.match(/第([^第]+?)轮/);
  if (!m) return null;
  const num = chineseToNumber(m[1]);
  return Number.isFinite(num) ? num : null;
}

// 使用 Vite 的 import.meta.glob 生成懒加载函数（不 eager）
// 文件放在 public 下，路径相对于仓库根目录：public/正方/*.md
// 运行时从 public/debate-manifest.json 加载文件清单并懒加载内容
let manifestLoaded = false;
const posKeyByRound = new Map<number, string>();
const negKeyByRound = new Map<number, string>();
const posTitleByRound = new Map<number, string>();
const negTitleByRound = new Map<number, string>();
const roundsSet = new Set<number>();

export const selectedRounds = ref<DebateRound[]>([]);

export async function ensureManifestLoaded(): Promise<void> {
  if (manifestLoaded) return;
  try {
    const res = await fetch("/debate-manifest.json");
    if (!res.ok) {
      console.error("无法加载 debate-manifest.json", res.status);
      manifestLoaded = true;
      return;
    }
    const json = await res.json();

    // 支持多种 manifest 格式：
    // 1) { positive: ["file.md"], negative: ["file.md"] }
    // 2) { proArguments: [{round:1,file:"01_...md",title:"..."}, ...], conArguments: [...] }
    // 3) 回退：字符串数组或带数字前缀的文件名（如 "01_..."）

    const posEntries: any[] = Array.isArray(json.positive)
      ? json.positive
      : Array.isArray(json.proArguments)
        ? json.proArguments
        : [];
    const negEntries: any[] = Array.isArray(json.negative)
      ? json.negative
      : Array.isArray(json.conArguments)
        ? json.conArguments
        : [];

    // 如果 manifest 中缺失关键回合（例如刚刚新增的 17/18 轮），在内存中补齐条目以便后续加载。
    const ensureAddProEntry = (round: number, file: string, title: string) => {
      const exists = posEntries.some((e: any) => {
        if (!e) return false;
        if (typeof e === "string") return e === file;
        return (
          Number(e.round) === round || e.file === file || e.title === title
        );
      });
      if (!exists) posEntries.push({ round, type: "Response", file, title });
    };

    ensureAddProEntry(
      17,
      "17_Response_AI取代人类的治理与责任框架.md",
      "AI取代人类的治理与责任框架",
    );
    ensureAddProEntry(
      18,
      "18_Response_社会过渡与再培训计划的可操作路径.md",
      "社会过渡与再培训计划的可操作路径",
    );

    posKeyByRound.clear();
    negKeyByRound.clear();
    posTitleByRound.clear();
    negTitleByRound.clear();
    roundsSet.clear();

    const tryParseRoundFromFilename = (fname: string): number | null => {
      if (!fname) return null;
      // 常见前缀：01_xxx 或 1_xxx
      const m = fname.match(/^0*([1-9][0-9]?)[_-]/);
      if (m) return Number(m[1]);
      // 尝试提取形如 第X轮 的中文文件名
      const ch = extractRoundNumberFromFilename(fname);
      if (ch !== null) return ch;
      // 最后一招：找第一个出现的数字（保守）
      const m2 = fname.match(/(\d{1,2})/);
      if (m2) return Number(m2[1]);
      return null;
    };

    // 解析正方条目
    for (const entry of posEntries) {
      if (!entry) continue;
      if (typeof entry === "string") {
        const round = tryParseRoundFromFilename(entry);
        if (round !== null) {
          posKeyByRound.set(round, entry);
          roundsSet.add(round);
        }
      } else if (typeof entry === "object") {
        const round =
          entry.round != null
            ? Number(entry.round)
            : tryParseRoundFromFilename(entry.file || entry.name || "");
        if (!Number.isNaN(round) && round != null) {
          const file = entry.file ?? entry.name ?? "";
          posKeyByRound.set(round, file || stripExt(String(entry.title ?? "")));
          const title = entry.title?.toString().trim();
          if (title) posTitleByRound.set(round, title);
          roundsSet.add(round);
        }
      }
    }

    // 解析反方条目
    for (const entry of negEntries) {
      if (!entry) continue;
      if (typeof entry === "string") {
        const round = tryParseRoundFromFilename(entry);
        if (round !== null) {
          negKeyByRound.set(round, entry);
          roundsSet.add(round);
        }
      } else if (typeof entry === "object") {
        const round =
          entry.round != null
            ? Number(entry.round)
            : tryParseRoundFromFilename(entry.file || entry.name || "");
        if (!Number.isNaN(round) && round != null) {
          const file = entry.file ?? entry.name ?? "";
          negKeyByRound.set(round, file || stripExt(String(entry.title ?? "")));
          const title = entry.title?.toString().trim();
          if (title) negTitleByRound.set(round, title);
          roundsSet.add(round);
        }
      }
    }

    const allRounds: DebateRound[] = Array.from(roundsSet)
      .sort((a, b) => a - b)
      .map((r) => ({
        round: r,
        positive: {
          title: posTitleByRound.get(r) ?? `正方 第${r}轮`,
          content: "",
          source: "GLM-5",
          time: "",
        },
        negative: {
          title: negTitleByRound.get(r) ?? `反方 第${r}轮`,
          content: "",
          source: "GLM-5",
          time: "",
        },
      }));

    selectedRounds.value = allRounds;
    manifestLoaded = true;
  } catch (e) {
    console.error("ensureManifestLoaded error", e);
    manifestLoaded = true;
  }
}

// 懒加载单个回合的内容（正反两方都尝试加载）
export async function loadRoundContent(
  round: number,
): Promise<DebateRound | null> {
  await ensureManifestLoaded();
  const idx = selectedRounds.value.findIndex((it) => it.round === round);
  if (idx === -1) return null;

  const entry = selectedRounds.value[idx];

  const mergeContent = (argument: Argument, raw: string): Argument => {
    const extractedTitle = extractArgumentTitleFromMarkdown(raw);
    return {
      ...argument,
      title: extractedTitle || argument.title,
      content: raw,
      source: argument.source || "GLM-5",
    };
  };

  // 加载正方（从 public 路径 fetch）
  const posFilename = posKeyByRound.get(round);
  if (
    posFilename &&
    (!entry.positive.content || entry.positive.content === "")
  ) {
    try {
      const url = `/${encodeURIComponent("正方")}/${encodeURIComponent(posFilename)}`;
      const rawRes = await fetch(url);
      if (rawRes.ok) {
        const raw = await rawRes.text();
        selectedRounds.value[idx] = {
          ...entry,
          positive: mergeContent(entry.positive, raw),
        };
      } else {
        console.warn("fetch 正方 md 失败", url, rawRes.status);
      }
    } catch (e) {
      console.warn("加载正方 md 失败", posFilename, e);
    }
  }

  // 加载反方
  const negFilename = negKeyByRound.get(round);
  if (
    negFilename &&
    (!selectedRounds.value[idx].negative.content ||
      selectedRounds.value[idx].negative.content === "")
  ) {
    try {
      const url = `/${encodeURIComponent("反方")}/${encodeURIComponent(negFilename)}`;
      const rawRes = await fetch(url);
      if (rawRes.ok) {
        const raw = await rawRes.text();
        const cur =
          selectedRounds.value.find((it) => it.round === round) || entry;
        const merged = { ...cur, negative: mergeContent(cur.negative, raw) };
        const curIdx = selectedRounds.value.findIndex(
          (it) => it.round === round,
        );
        if (curIdx !== -1) selectedRounds.value[curIdx] = merged;
      } else {
        console.warn("fetch 反方 md 失败", url, rawRes.status);
      }
    } catch (e) {
      console.warn("加载反方 md 失败", negFilename, e);
    }
  }

  return selectedRounds.value.find((it) => it.round === round) ?? null;
}

// 非阻塞预取回合内容
export function prefetchRound(round: number) {
  void loadRoundContent(round);
}

// 加载所有回合（谨慎使用）
export async function loadAllRounds(): Promise<DebateRound[]> {
  await ensureManifestLoaded();
  await Promise.all(Array.from(roundsSet).map((r) => loadRoundContent(r)));
  return selectedRounds.value;
}
// 注意：已实现的函数位于上方，已移除旧的重复实现
