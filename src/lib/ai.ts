import Groq from "groq-sdk";
import { formatTimestamp } from "./youtube";
import type { TranscriptSegment, AnalysisResult } from "@/types";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export function buildAnalysisPrompt(segments: TranscriptSegment[]): string {
  const transcriptText = segments
    .map((s) => `[${formatTimestamp(s.start)}] ${s.text}`)
    .join("\n");

  return `다음은 유튜브 영상의 자막(타임스탬프 포함)입니다. 아래 형식의 JSON으로 분석 결과를 반환하세요.

## 자막
${transcriptText}

## 출력 형식 (순수 JSON만 반환, 코드블록 없이)
{
  "summary": ["요약 1문장", "요약 2문장", "요약 3문장", "요약 4문장", "요약 5문장"],
  "timeline": [
    { "timestamp": "MM:SS 또는 HH:MM:SS", "startSeconds": 숫자, "content": "해당 구간 핵심 내용" }
  ],
  "keywords": ["키워드1", "키워드2"],
  "actionItems": ["액션 아이템1", "액션 아이템2"]
}

## 지침
- summary: 영상 전체를 정확히 5문장으로 요약. 핵심 키워드를 문장 안에 자연스럽게 포함. IT·전문 용어는 괄호로 쉬운 설명 병기 (예: "LLM(대형 언어 모델)"). 중학생도 이해할 수 있는 쉬운 말로 작성.
- 타임라인: 주요 전환점마다 항목 생성 (최소 3개, 최대 10개). 각 구간 핵심을 한 문장으로 쉽게 설명.
- keywords: 영상의 핵심 개념어 5~10개. 어려운 용어는 "용어(쉬운 설명)" 형식으로 작성.
- actionItems: 비전공자가 당장 따라 할 수 있는 구체적이고 쉬운 행동 지침.
- 반드시 한국어로 작성`;
}

function sampleSegments(segments: TranscriptSegment[], max = 200): TranscriptSegment[] {
  if (segments.length <= max) return segments;
  const step = segments.length / max;
  return Array.from({ length: max }, (_, i) => segments[Math.floor(i * step)]);
}

export async function analyzeTranscript(segments: TranscriptSegment[]): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(sampleSegments(segments));
  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "당신은 영상 콘텐츠 분석 전문가입니다. 자막을 분석해 구조화된 JSON만 반환합니다.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  const text = completion.choices[0]?.message?.content ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 응답에서 JSON을 파싱할 수 없습니다.");
  }

  const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);

  if (!parsed.summary || parsed.summary.length !== 5) {
    throw new Error("AI 응답 형식이 올바르지 않습니다: summary는 5개여야 합니다.");
  }

  return parsed;
}
