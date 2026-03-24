# AI 제안서 생성기 — HANDOFF

## 프로젝트 개요
URL을 입력하면 웹페이지를 스크래핑하고, AI(Gemini 2.5 Flash)가 제안서를 자동 생성하는 웹앱.
회원가입 없이 전역 공유. Vercel 배포 예정.

## 기술 스택
- **Framework**: Next.js 16.2.1 (App Router) + TypeScript + Tailwind CSS v4
- **AI**: Google Gemini API (gemini-2.5-flash, 무료 tier)
- **스크래핑**: cheerio (서버사이드 HTML 파싱)
- **DB**: Supabase (미연동 — Step 3에서 진행)
- **디자인**: Glassmorphism + 라이트 모노크롬 / 폰트: Sora(display) + DM Sans(body)

## 현재 완료된 단계

### Step 1: 프로젝트 초기화 + 기본 레이아웃 ✅
### Step 2: URL → 스크래핑 → AI 생성 파이프라인 ✅

## 파일 구조 (현재 상태)
```
src/
├── app/
│   ├── layout.tsx                # 루트 레이아웃 (Sora + DM Sans 폰트)
│   ├── page.tsx                  # 메인 페이지 (헤더, URL입력, 통계, 프롬프트, 결과, 최근제안서)
│   ├── globals.css               # Tailwind + glassmorphism + 모노크롬 디자인 시스템
│   ├── settings/page.tsx         # (미사용 — 프롬프트가 메인 페이지로 이동됨)
│   └── api/
│       ├── scrape/route.ts       # POST /api/scrape — URL 스크래핑
│       └── generate/route.ts     # POST /api/generate — AI 제안서 스트리밍 생성
├── components/
│   ├── ui/GlassCard.tsx          # 재사용 glassmorphism 카드
│   ├── UrlInputForm.tsx          # URL 입력 폼 + 스크래핑→생성 플로우
│   ├── ProposalResult.tsx        # 결과 표시 + 복사/다운로드 + "작성 중" 뱃지
│   └── PromptCustomization.tsx   # 드롭다운 프롬프트 편집기 + 저장 버튼 (DB 미연결)
└── lib/
    ├── types.ts                  # TypeScript 인터페이스 (ScrapeRequest, GenerateRequest 등)
    ├── scraper.ts                # cheerio 기반 URL 스크래핑 (8000자 제한)
    └── openrouter.ts             # Gemini API 스트리밍 호출 + 기본 프롬프트 템플릿
```

## 동작하는 핵심 플로우
```
URL 입력 → POST /api/scrape (cheerio) → POST /api/generate (Gemini SSE 스트리밍) → 실시간 화면 표시
```

## 구현된 UI 기능
- 헤더: "Proposal Generator" 로고 + Ready/Generating 상태
- URL 입력 폼 + "제안서 생성" 버튼 (로딩 상태 포함)
- 우측 통계: 글자 수 카운트, 사용 AI 모델 표시
- 프롬프트 커스터마이징: 드롭다운 토글 + 편집 + 초기화 + 저장 버튼
- 제안서 결과: "작성 중" 뱃지, 복사 기능, .md 다운로드 기능
- 최근 제안서: 플레이스홀더 카드뷰 (DB 연동 시 실제 데이터로 교체)

## 환경변수 (.env.local)
```
GEMINI_API_KEY=<발급된 키>
NEXT_PUBLIC_SUPABASE_URL=<미설정>
SUPABASE_SERVICE_ROLE_KEY=<미설정>
```

## 남은 작업

### Step 3: Supabase 연동
- Supabase 프로젝트 생성 + 테이블 2개 생성:
  - `proposals` (id, url, scraped_content, proposal_content, status, created_at)
  - `prompt_templates` (id, name, content, is_active, created_at)
- `src/lib/supabase.ts` 클라이언트 설정
- 제안서 생성 완료 시 DB 자동 저장
- "최근 제안서" 카드뷰에 DB 데이터 표시 + 클릭 시 `/proposals/[id]` 상세 페이지
- 프롬프트: 접속 시 DB에서 불러오기 + "저장" 버튼으로 DB 저장
- `PromptCustomization`의 `onSave` prop은 이미 준비됨 (page.tsx에서 연결 필요)

### Step 4: Vercel 배포
- 환경변수 설정 + 배포 + 프로덕션 테스트

## 주의사항
- `src/app/settings/page.tsx`는 현재 미사용. 프롬프트 기능이 메인 페이지 드롭다운으로 이동됨. 삭제 가능.
- `src/lib/openrouter.ts` 파일명이 openrouter이지만 실제로는 Gemini API를 호출함 (초기에 Openrouter로 설계 후 Gemini로 변경). 리네이밍 고려.
- cheerio 기반 스크래핑은 SPA(JS 렌더링) 사이트에서 내용 추출 불가.
- Gemini 무료 tier에는 rate limit이 있음 (분당 요청 수 제한).

## 실행 방법
```bash
npm run dev     # http://localhost:3000
npm run build   # 프로덕션 빌드 검증
```
