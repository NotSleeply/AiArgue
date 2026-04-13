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
export const positiveName = "正方 Trae";
export const negativeName = "反方 CodeBuddy";
export const totalRounds = 60;

export const finalConclusion = {
  winner: "反方",
  winnerFull: "反方 CodeBuddy",
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

// Helper: 从路径中取文件名
const basenameFromPath = (p: string) => p.split("/").pop() || p;

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
const posGlob = import.meta.glob("../../public/正方/*.md", {
  as: "raw",
}) as Record<string, () => Promise<string>>;
const negGlob = import.meta.glob("../../public/反方/*.md", {
  as: "raw",
}) as Record<string, () => Promise<string>>;

// 将文件 key 映射为轮次（不立即 fetch 内容）
const posKeyByRound = new Map<number, string>();
const negKeyByRound = new Map<number, string>();
const posTitleByRound = new Map<number, string>();
const negTitleByRound = new Map<number, string>();

for (const key of Object.keys(posGlob)) {
  const normalized = key.replace(/\\/g, "/");
  const name = basenameFromPath(normalized);
  const round = extractRoundNumberFromFilename(name);
  if (round !== null) {
    posKeyByRound.set(round, key);
    posTitleByRound.set(round, stripExt(name));
  }
}

for (const key of Object.keys(negGlob)) {
  const normalized = key.replace(/\\/g, "/");
  const name = basenameFromPath(normalized);
  const round = extractRoundNumberFromFilename(name);
  if (round !== null) {
    negKeyByRound.set(round, key);
    negTitleByRound.set(round, stripExt(name));
  }
}

// 先构建占位的回合列表（content 为空），在需要时按回合懒加载内容
const roundsSet = new Set<number>([
  ...posKeyByRound.keys(),
  ...negKeyByRound.keys(),
]);
const allRounds: DebateRound[] = Array.from(roundsSet)
  .sort((a, b) => a - b)
  .map((r) => ({
    round: r,
    positive: {
      title: posTitleByRound.get(r) ?? `正方 第${r}轮`,
      content: "",
      source: "",
      time: "",
    },
    negative: {
      title: negTitleByRound.get(r) ?? `反方 第${r}轮`,
      content: "",
      source: "",
      time: "",
    },
  }));

export const selectedRounds = ref<DebateRound[]>(allRounds);

// 懒加载单个回合的内容（正反两方都尝试加载）
export async function loadRoundContent(
  round: number,
): Promise<DebateRound | null> {
  const idx = selectedRounds.value.findIndex((it) => it.round === round);
  if (idx === -1) return null;

  const entry = selectedRounds.value[idx];

  // 加载正方
  const posKey = posKeyByRound.get(round);
  if (posKey && (!entry.positive.content || entry.positive.content === "")) {
    try {
      const raw = await posGlob[posKey]();
      selectedRounds.value[idx] = {
        ...entry,
        positive: { ...entry.positive, content: raw },
      };
    } catch (e) {
      console.warn("加载正方 md 失败", posKey, e);
    }
  }

  // 加载反方
  const negKey = negKeyByRound.get(round);
  if (negKey && (!entry.negative.content || entry.negative.content === "")) {
    try {
      const raw = await negGlob[negKey]();
      // 可能上面已经替换了 selectedRounds.value[idx]
      const cur =
        selectedRounds.value.find((it) => it.round === round) || entry;
      const merged = { ...cur, negative: { ...cur.negative, content: raw } };
      const curIdx = selectedRounds.value.findIndex((it) => it.round === round);
      if (curIdx !== -1) selectedRounds.value[curIdx] = merged;
    } catch (e) {
      console.warn("加载反方 md 失败", negKey, e);
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
  await Promise.all(Array.from(roundsSet).map((r) => loadRoundContent(r)));
  return selectedRounds.value;
}
