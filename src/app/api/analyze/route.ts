import { NextRequest, NextResponse } from "next/server";
import { validateYoutubeUrl, extractVideoId, getTranscript } from "@/lib/youtube";
import { analyzeTranscript } from "@/lib/ai";
import type { AnalyzeResponse } from "@/types";

function toFriendlyError(message: string): string {
  if (message.includes("429") || message.includes("rate_limit") || message.includes("quota")) {
    return "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (message.includes("401") || message.includes("invalid_api_key") || message.includes("Invalid API Key")) {
    return "API 키가 올바르지 않습니다. .env.local의 GROQ_API_KEY를 확인해 주세요.";
  }
  if (message.includes("No transcript") || message.includes("transcript")) {
    return "이 영상에는 자막이 없어 분석할 수 없습니다.";
  }
  if (message.includes("Could not find") || message.includes("video unavailable")) {
    return "영상을 찾을 수 없습니다. URL을 다시 확인해 주세요.";
  }
  return message;
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { url } = body;

  if (!url) {
    return NextResponse.json({ success: false, error: "URL을 입력해 주세요." }, { status: 400 });
  }

  if (!validateYoutubeUrl(url)) {
    return NextResponse.json(
      { success: false, error: "유효한 유튜브 링크를 입력해 주세요." },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json({ success: false, error: "영상 ID를 추출할 수 없습니다." }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { success: false, error: "서버에 GROQ_API_KEY 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const segments = await getTranscript(videoId);
    const analysis = await analyzeTranscript(segments);

    return NextResponse.json({
      success: true,
      videoInfo: {
        videoId,
        title: `YouTube 영상 (${videoId})`,
        channelName: "알 수 없음",
        url,
      },
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.";
    const friendly = toFriendlyError(message);
    return NextResponse.json({ success: false, error: friendly }, { status: 500 });
  }
}
