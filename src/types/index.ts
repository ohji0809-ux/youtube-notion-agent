export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface AnalysisResult {
  summary: string[];           // 3줄 요약
  timeline: TimelineItem[];    // 타임라인별 요약
  keywords: string[];          // 주요 키워드
  actionItems: string[];       // 액션 아이템
}

export interface TimelineItem {
  timestamp: string;           // "00:01:23" 형식
  startSeconds: number;
  content: string;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  channelName: string;
  url: string;
}

export interface NotionConfig {
  token: string;
  databaseId: string;
}

export interface NotionPage {
  id: string;
  url: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  videoInfo?: VideoInfo;
  analysis?: AnalysisResult;
  error?: string;
}

export interface NotionSendRequest {
  videoInfo: VideoInfo;
  analysis: AnalysisResult;
}

export interface NotionSendResponse {
  success: boolean;
  pageUrl?: string;
  error?: string;
}

export type ProgressStep =
  | "idle"
  | "validating"
  | "extracting"
  | "analyzing"
  | "sending"
  | "done"
  | "error";
