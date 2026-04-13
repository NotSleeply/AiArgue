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

// 使用 Vite 的 import.meta.glob 同步（eager）加载 Markdown 文件为原始文本
// 注意：路径是相对于本文件（src/data）到仓库根目录
const posFiles = import.meta.glob("../../正方/*.md", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const negFiles = import.meta.glob("../../反方/*.md", {
  as: "raw",
  eager: true,
}) as Record<string, string>;

const posMap = new Map<number, Argument>();
for (const [path, raw] of Object.entries(posFiles)) {
  const name = basenameFromPath(path);
  const round = extractRoundNumberFromFilename(name);
  const title = stripExt(name);
  const arg: Argument = { title, content: raw, source: "", time: "" };
  if (round !== null) posMap.set(round, arg);
}

const negMap = new Map<number, Argument>();
for (const [path, raw] of Object.entries(negFiles)) {
  const name = basenameFromPath(path);
  const round = extractRoundNumberFromFilename(name);
  const title = stripExt(name);
  const arg: Argument = { title, content: raw, source: "", time: "" };
  if (round !== null) negMap.set(round, arg);
}

// 合并回合，按轮次排序
const roundsSet = new Set<number>([...posMap.keys(), ...negMap.keys()]);
const allRounds: DebateRound[] = Array.from(roundsSet)
  .sort((a, b) => a - b)
  .map((r) => ({
    round: r,
    positive: posMap.get(r) ?? {
      title: `正方 第${r}轮`,
      content: "",
      source: "",
      time: "",
    },
    negative: negMap.get(r) ?? {
      title: `反方 第${r}轮`,
      content: "",
      source: "",
      time: "",
    },
  }));

// 导出为可响应的 ref 以兼容现有使用（App.vue 中使用 selectedRounds.value）
export const selectedRounds = ref<DebateRound[]>(allRounds);

// 也导出一个异步加载接口（如果需要动态加载）
export async function loadAllRounds(): Promise<DebateRound[]> {
  // 如果希望改成运行时动态加载，可在此实现
  return selectedRounds.value;
}
