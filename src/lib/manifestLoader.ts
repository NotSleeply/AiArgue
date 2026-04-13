// Load and parse public/debate-manifest.json and expose lookup helpers
let manifestLoaded = false;
const posKeyByRound = new Map<number, string>();
const negKeyByRound = new Map<number, string>();
const posTitleByRound = new Map<number, string>();
const negTitleByRound = new Map<number, string>();
const roundsSet = new Set<number>();

const stripExt = (name: string) => name.replace(/\.[^/.]+$/, "");

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
  if (s.length === 1) return map[s] ?? Number(s);
  const maybeNum = Number(s);
  if (!Number.isNaN(maybeNum)) return maybeNum;
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

const tryParseRoundFromFilename = (fname: string): number | null => {
  if (!fname) return null;
  const m = fname.match(/^0*([1-9][0-9]?)[_-]/);
  if (m) return Number(m[1]);
  const ch = extractRoundNumberFromFilename(fname);
  if (ch !== null) return ch;
  const m2 = fname.match(/(\d{1,2})/);
  if (m2) return Number(m2[1]);
  return null;
};

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

    for (const entry of posEntries) {
      if (!entry) continue;
      if (typeof entry === "string") {
        const round = tryParseRoundFromFilename(entry);
        if (round !== null) {
          posKeyByRound.set(round, entry);
          posTitleByRound.set(round, stripExt(entry));
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

    for (const entry of negEntries) {
      if (!entry) continue;
      if (typeof entry === "string") {
        const round = tryParseRoundFromFilename(entry);
        if (round !== null) {
          negKeyByRound.set(round, entry);
          negTitleByRound.set(round, stripExt(entry));
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

    manifestLoaded = true;
  } catch (e) {
    console.error("ensureManifestLoaded error", e);
    manifestLoaded = true;
  }
}

export function getPosFilename(round: number): string | undefined {
  return posKeyByRound.get(round);
}

export function getNegFilename(round: number): string | undefined {
  return negKeyByRound.get(round);
}

export function getPosTitle(round: number): string | undefined {
  return posTitleByRound.get(round);
}

export function getNegTitle(round: number): string | undefined {
  return negTitleByRound.get(round);
}

export function getAllRoundNumbers(): number[] {
  return Array.from(roundsSet).sort((a, b) => a - b);
}

export function buildInitialRounds(defaultSource = "GLM-5") {
  return Array.from(roundsSet)
    .sort((a, b) => a - b)
    .map((r) => ({
      round: r,
      positive: {
        title: posTitleByRound.get(r) ?? `正方 第${r}轮`,
        content: "",
        source: defaultSource,
        time: "",
      },
      negative: {
        title: negTitleByRound.get(r) ?? `反方 第${r}轮`,
        content: "",
        source: defaultSource,
        time: "",
      },
    }));
}
