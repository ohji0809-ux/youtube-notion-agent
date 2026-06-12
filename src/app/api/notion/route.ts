import { NextRequest, NextResponse } from "next/server";
import { createNotionPage } from "@/lib/notion";
import type { NotionSendRequest, NotionSendResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<NotionSendResponse>> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    return NextResponse.json(
      { success: false, error: "서버에 NOTION_TOKEN 또는 NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: Partial<NotionSendRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { videoInfo, analysis } = body;

  if (!videoInfo || !analysis) {
    return NextResponse.json(
      { success: false, error: "videoInfo와 analysis가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const page = await createNotionPage(videoInfo, analysis, { token, databaseId });
    return NextResponse.json({ success: true, pageUrl: page.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "노션 전송 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
