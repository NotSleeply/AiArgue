// 辩论数据（自动从正方/反方目录同步加载）
// data/debate.ts 仅保留类型与常量，实际的数据与加载逻辑移至 composable

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
export const negativeName = "反方";
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

// 注意：manifest 加载、回合列表与内容懒加载已抽离到
// src/lib/manifestLoader.ts 与 src/composables/useDebate.ts
