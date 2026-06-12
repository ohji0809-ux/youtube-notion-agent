import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment } from "@/types";

const YOUTUBE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?.*v=[\w-]{11}|embed\/[\w-]{11})|youtu\.be\/[\w-]{11})/;

export function validateYoutubeUrl(url: string): boolean {
  if (!url) return false;
  return YOUTUBE_URL_PATTERN.test(url);
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([\w-]{11})/,         // youtube.com/watch?v=...
    /youtu\.be\/([\w-]{11})/,    // youtu.be/...
    /embed\/([\w-]{11})/,        // youtube.com/embed/...
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    const hh = String(h).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export async function getTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const raw = await YoutubeTranscript.fetchTranscript(videoId);
  return raw.map((item) => ({
    text: item.text,
    start: item.offset / 1000,
    duration: item.duration / 1000,
  }));
}
