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
