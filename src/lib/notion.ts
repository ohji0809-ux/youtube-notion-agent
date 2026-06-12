import { Client } from "@notionhq/client";
import type { VideoInfo, AnalysisResult, NotionConfig, NotionPage } from "@/types";

function buildNotionBlocks(videoInfo: VideoInfo, analysis: AnalysisResult) {
  return [
    // 영상 링크
    {
      object: "block",
      type: "bookmark",
      bookmark: { url: videoInfo.url },
    },
    // 구분선
    { object: "block", type: "divider", divider: {} },
    // 3줄 요약
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "📝 5줄 요약" } }] },
    },
    ...analysis.summary.map((line) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ type: "text", text: { content: line } }] },
    })),
    // 타임라인
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "⏱ 타임라인" } }] },
    },
    ...analysis.timeline.map((item) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: `[${item.timestamp}] ` }, annotations: { bold: true } },
          { type: "text", text: { content: item.content } },
        ],
      },
    })),
    // 키워드
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "🏷 키워드" } }] },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: analysis.keywords.join("  ·  ") } }],
      },
    },
    // 액션 아이템
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "✅ 액션 아이템" } }] },
    },
    ...analysis.actionItems.map((item) => ({
      object: "block",
      type: "to_do",
      to_do: { rich_text: [{ type: "text", text: { content: item } }], checked: false },
    })),
  ];
}

export async function createNotionPage(
  videoInfo: VideoInfo,
  analysis: AnalysisResult,
  config: NotionConfig
): Promise<NotionPage> {
  const notion = new Client({ auth: config.token });

  const response = await notion.pages.create({
    parent: { database_id: config.databaseId },
    properties: {
      Name: {
        title: [{ type: "text", text: { content: videoInfo.title } }],
      },
    },
    children: buildNotionBlocks(videoInfo, analysis) as any,
  });

  return {
    id: response.id,
    url: (response as any).url ?? `https://notion.so/${response.id.replace(/-/g, "")}`,
  };
}

export async function testNotionConnection(config: NotionConfig): Promise<boolean> {
  try {
    const notion = new Client({ auth: config.token });
    await notion.databases.retrieve({ database_id: config.databaseId });
    return true;
  } catch {
    return false;
  }
}
