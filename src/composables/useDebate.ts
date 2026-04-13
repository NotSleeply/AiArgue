import { ref } from "vue";
import * as manifestLoader from "../lib/manifestLoader";
import { extractArgumentTitleFromMarkdown } from "../lib/markdown";
import type { DebateRound, Argument } from "../types/debate";

const selectedRounds = ref<DebateRound[]>([]);

export default function useDebate() {
  const ensureManifestLoaded = async (): Promise<void> => {
    await manifestLoader.ensureManifestLoaded();
    // 仅在尚未初始化 selectedRounds 时赋值，避免重复重写触发外部 watcher 循环
    if (!selectedRounds.value || selectedRounds.value.length === 0) {
      selectedRounds.value =
        manifestLoader.buildInitialRounds() as DebateRound[];
    }
  };

  const mergeContent = (argument: Argument, raw: string): Argument => {
    const extractedTitle = extractArgumentTitleFromMarkdown(raw);
    return {
      ...argument,
      title: extractedTitle || argument.title,
      content: raw,
      source: argument.source || "GLM-5",
    };
  };

  const loadRoundContent = async (
    round: number,
  ): Promise<DebateRound | null> => {
    await ensureManifestLoaded();
    const idx = selectedRounds.value.findIndex((it) => it.round === round);
    if (idx === -1) return null;

    const entry = selectedRounds.value[idx];

    // 正方
    const posFilename = manifestLoader.getPosFilename(round);
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

    // 反方
    const negFilename = manifestLoader.getNegFilename(round);
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
  };

  const prefetchRound = (round: number) => {
    void loadRoundContent(round);
  };

  const loadAllRounds = async (): Promise<DebateRound[]> => {
    await ensureManifestLoaded();
    await Promise.all(
      manifestLoader.getAllRoundNumbers().map((r) => loadRoundContent(r)),
    );
    return selectedRounds.value;
  };

  return {
    selectedRounds,
    ensureManifestLoaded,
    loadRoundContent,
    prefetchRound,
    loadAllRounds,
  };
}
