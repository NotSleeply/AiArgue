import { ref } from "vue";

export default function useAutoPlay(
  getCanNext: () => boolean,
  onNext: () => void,
  intervalMs = 8000,
) {
  const isPlaying = ref(false);
  let timer: number | null = null;

  const start = () => {
    if (isPlaying.value) return;
    isPlaying.value = true;
    timer = window.setInterval(() => {
      try {
        if (getCanNext()) {
          onNext();
        } else {
          stop();
        }
      } catch (e) {
        console.warn("useAutoPlay onNext error", e);
        stop();
      }
    }, intervalMs);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    isPlaying.value = false;
  };

  const toggle = () => {
    if (isPlaying.value) stop();
    else start();
  };

  return { isPlaying, start, stop, toggle };
}
