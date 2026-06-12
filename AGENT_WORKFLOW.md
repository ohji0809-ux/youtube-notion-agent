# YouTube to Notion Agent — Workflow Diagram

## 전체 에이전트 흐름

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        사용자 (Browser UI)                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ① 유튜브 URL 입력 + "분석" 클릭
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         UrlInput Component                               │
│                                                                         │
│  validateYoutubeUrl(url)  ──── FAIL ───► "유효한 유튜브 링크를 입력하세요"  │
│          │                                                               │
│         PASS                                                             │
│          │                                                               │
│  onSubmit(url) 호출                                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ② POST /api/analyze  { url }
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      /api/analyze  (Next.js Route)                       │
│                                                                         │
│  Step 1. validateYoutubeUrl(url)                                        │
│           └── FAIL ──► 400 { success: false, error: "..." }             │
│                                                                         │
│  Step 2. extractVideoId(url)  ──► videoId                               │
│                                                                         │
│  Step 3. getTranscript(videoId)                                         │
│           └── ① YouTube 공식 자막 API 조회                               │
│               └── 실패 ──► throw Error("자막 없음")                      │
│                                                                         │
│  Step 4. analyzeTranscript(segments)  ──► Claude Sonnet API 호출        │
│           └── 실패 ──► 500 { success: false, error: "..." }             │
│                                                                         │
│  ──► 200 { success: true, videoInfo, analysis }                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ③ AI 분석 결과 → ResultPreview 렌더링
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ResultPreview Component                            │
│                                                                         │
│  ┌─────────────────────────────────────────┐                           │
│  │  영상 제목 / 채널명 / URL               │                           │
│  │  ─────────────────────────────────────  │                           │
│  │  📝 3줄 요약                            │                           │
│  │  ⏱  타임라인별 주요 내용               │                           │
│  │  🏷  주요 키워드 태그                   │                           │
│  │  ☐  액션 아이템 (체크리스트)           │                           │
│  │  ─────────────────────────────────────  │                           │
│  │  [노션으로 전송]  [노션에서 열기 →]     │                           │
│  └─────────────────────────────────────────┘                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ④ "노션으로 전송" 클릭
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       /api/notion  (Next.js Route)                       │
│                                                                         │
│  POST { videoInfo, analysis, config: { token, databaseId } }            │
│                                                                         │
│  Step 1. config 유효성 검사                                              │
│           └── FAIL ──► 400 { success: false, error: "설정 필요" }       │
│                                                                         │
│  Step 2. createNotionPage(videoInfo, analysis, config)                  │
│           └── Notion API v1 호출                                         │
│               ├── properties: 제목, URL, 채널명, 태그, 작성일            │
│               └── children blocks:                                       │
│                   ├── ## 3줄 요약  (bulleted_list)                       │
│                   ├── ## 타임라인  (bulleted_list + bold timestamp)      │
│                   ├── ## 주요 키워드  (paragraph)                        │
│                   └── ## 액션 아이템  (to_do blocks)                     │
│           └── 실패 ──► 500 { success: false, error: "..." }             │
│                                                                         │
│  ──► 200 { success: true, pageUrl }                                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ⑤ pageUrl 수신 → "노션에서 열기" 링크 표시
                                 │
                                 ▼
                         ✅ 완료 (Done)
```

---

## 에이전트 내부 데이터 흐름

```
YouTube URL
    │
    ├─► lib/youtube.ts
    │       ├── validateYoutubeUrl()  → boolean
    │       ├── extractVideoId()      → string | null
    │       ├── formatTimestamp()     → "MM:SS" | "HH:MM:SS"
    │       └── getTranscript()       → TranscriptSegment[]
    │                                      { text, start, duration }
    │
    ├─► lib/ai.ts
    │       ├── buildAnalysisPrompt(segments) → string (프롬프트)
    │       └── analyzeTranscript(segments)
    │               └─► Claude Sonnet 4.6 API
    │                       └── AnalysisResult
    │                             { summary[3], timeline[], keywords[], actionItems[] }
    │
    └─► lib/notion.ts
            ├── testNotionConnection(config) → boolean
            └── createNotionPage(videoInfo, analysis, config)
                    └─► Notion API v1
                            └── NotionPage { id, url }
```

---

## 컴포넌트 상태 머신

```
                    ┌──────────┐
                    │  idle    │ ◄── 초기 / 재시작
                    └────┬─────┘
                         │ URL 제출
                         ▼
                    ┌──────────────┐
                    │  validating  │ URL 형식 검사
                    └────┬─────────┘
                         │ 유효
                         ▼
                    ┌──────────────┐
                    │  extracting  │ 자막 추출 중
                    └────┬─────────┘
                         │ 성공
                         ▼
                    ┌──────────────┐
                    │  analyzing   │ Claude AI 분석 중
                    └────┬─────────┘
                         │ 성공
                         ▼
                    ┌──────────────┐
                    │  done        │ 결과 미리보기 표시
                    └────┬────┬────┘
              전송 클릭 │    │ 에러 발생
                         ▼    ▼
                    ┌──────────────┐  ┌──────────────┐
                    │  sending     │  │  error       │
                    └────┬─────────┘  └──────────────┘
                         │ 성공
                         ▼
                    ┌──────────────┐
                    │  done        │ "노션에서 열기" 링크 표시
                    └──────────────┘
```

---

## 기술 스택 매핑

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Tailwind, Glassmorphism Dark UI)  │
│  ┌───────────┐ ┌─────────────┐ ┌─────────────────┐  │
│  │ UrlInput  │ │ ProgressBar │ │  SettingsModal  │  │
│  └───────────┘ └─────────────┘ └─────────────────┘  │
│                ┌───────────────────────────────────┐ │
│                │       ResultPreview               │ │
│                └───────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────┘
                           │ fetch()
┌──────────────────────────▼──────────────────────────┐
│  Backend (Next.js App Router API Routes)             │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  /api/analyze    │  │      /api/notion          │ │
│  └────────┬─────────┘  └────────────┬─────────────┘ │
└───────────┼──────────────────────────┼───────────────┘
            │                          │
   ┌────────▼──────────┐   ┌──────────▼────────────┐
   │  lib/youtube.ts   │   │    lib/notion.ts       │
   │  lib/ai.ts        │   │    @notionhq/client    │
   │  youtube-transcript│   └───────────────────────┘
   │  @anthropic-ai/sdk│
   └───────────────────┘
```
