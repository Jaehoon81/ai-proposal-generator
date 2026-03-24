# AI 제안서 생성기 — HANDOFF

## 프로젝트 개요
URL을 입력하면 웹페이지를 스크래핑하고, AI(Gemini 2.5 Flash)가 제안서를 자동 생성하는 웹앱.
회원가입 없이 전역 공유. Vercel 배포 완료.

## GitHub
https://github.com/Jaehoon81/ai-proposal-generator

## 기술 스택
- **Framework**: Next.js 16.2.1 (App Router) + TypeScript + Tailwind CSS v4
- **AI**: Google Gemini API (gemini-2.5-flash, 무료 tier)
- **스크래핑**: cheerio (서버사이드 HTML 파싱)
- **DB**: Supabase (서울 리전, project ref: `<your-project-ref>`)
- **배포**: Vercel (프로덕션 URL: `https://ai-proposal-generator-livid.vercel.app`)
- **디자인**: 퍼플 톤 + 다크 모드 / 폰트: Sora(display) + DM Sans(body)

## 현재 완료된 단계

### Step 1: 프로젝트 초기화 + 기본 레이아웃 ✅
### Step 2: URL → 스크래핑 → AI 생성 파이프라인 ✅
### Step 3: Supabase 연동 + 제안서 저장/목록 + 프롬프트 저장 ✅
### Step 4: Vercel 배포 + 프로덕션 테스트 ✅

## 파일 구조 (현재 상태)
```
src/
├── app/
│   ├── layout.tsx                # 루트 레이아웃 (폰트 + 다크 모드 초기화 스크립트)
│   ├── page.tsx                  # 메인 페이지 (헤더, URL입력, 통계, 프롬프트, 결과, 최근제안서, 다크모드 토글)
│   ├── globals.css               # 퍼플 톤 디자인 시스템 (라이트/다크 모드 변수)
│   ├── proposals/[id]/page.tsx   # 제안서 상세 페이지 (복사/다운로드/메인 네비게이션)
│   ├── settings/page.tsx         # (미사용 — 프롬프트가 메인 페이지로 이동됨)
│   └── api/
│       ├── scrape/route.ts       # POST /api/scrape — URL 스크래핑
│       ├── generate/route.ts     # POST /api/generate — AI 제안서 스트리밍 생성
│       ├── proposals/route.ts    # GET: 목록 조회 (is_deleted 필터) / POST: 제안서 저장
│       ├── proposals/[id]/route.ts # GET: 단건 조회 / DELETE: 소프트 삭제
│       └── prompt/route.ts       # GET: 활성 프롬프트 불러오기 / POST: 프롬프트 저장
├── components/
│   ├── ui/GlassCard.tsx          # 재사용 카드 컴포넌트
│   ├── UrlInputForm.tsx          # URL 입력 폼 + 스크래핑→생성 플로우
│   ├── ProposalResult.tsx        # 결과 표시 + 복사/다운로드 + 저장/취소 버튼
│   └── PromptCustomization.tsx   # 드롭다운 프롬프트 편집기 + DB 저장 연결
└── lib/
    ├── types.ts                  # TypeScript 인터페이스 (Proposal, SaveProposalRequest 등)
    ├── scraper.ts                # cheerio 기반 URL 스크래핑 (8000자 제한)
    ├── supabase.ts               # Supabase 클라이언트 (anon key)
    └── openrouter.ts             # Gemini API 스트리밍 호출 + 기본 프롬프트 템플릿

supabase/
└── migrations/
    ├── 20260324060555_create_tables.sql     # proposals + prompt_templates 테이블
    └── 20260324074234_add_is_deleted.sql    # proposals.is_deleted 컬럼 추가
```

## DB 스키마

### `proposals`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| url | TEXT | 입력한 URL |
| scraped_title | TEXT | 스크래핑된 페이지 제목 |
| scraped_content | TEXT | 스크래핑된 원본 텍스트 |
| proposal_content | TEXT | AI 생성 제안서 |
| status | TEXT | completed |
| is_deleted | BOOLEAN | 소프트 삭제 플래그 (default: false) |
| created_at | TIMESTAMPTZ | 생성일 |

### `prompt_templates`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| name | TEXT | 템플릿 이름 (default) |
| content | TEXT | 프롬프트 본문 ({{title}}, {{content}} 플레이스홀더) |
| is_active | BOOLEAN | 활성 여부 |
| created_at | TIMESTAMPTZ | 생성일 |

## 동작하는 핵심 플로우
```
URL 입력 → POST /api/scrape (cheerio)
         → POST /api/generate (Gemini SSE 스트리밍)
         → 실시간 화면 표시
         → 사용자가 "저장" 클릭 시 POST /api/proposals → DB 저장 + 목록 갱신
         → "취소" 클릭 시 저장 없이 화면 초기화
```

## 구현된 UI 기능
- 헤더: "Proposal Generator" 로고 + Ready/Generating 상태 + 다크 모드 토글 (달/해 아이콘)
- URL 입력 폼 + "제안서 생성" 버튼 (로딩 상태 포함)
- 우측 통계: 글자 수 카운트, 사용 AI 모델 표시
- 프롬프트 커스터마이징: 드롭다운 토글 + 편집 + 초기화 + DB 저장/불러오기
- 제안서 결과: "작성 중" 뱃지, 복사/다운로드, 저장/취소 버튼
- 최근 제안서: DB 데이터 카드뷰 + 클릭 시 상세 페이지 + X 버튼 소프트 삭제
- 다크 모드: localStorage 저장 + 시스템 설정 감지 + 깜박임 방지 스크립트

## 환경변수 (.env.local)
```
GEMINI_API_KEY=<발급된 키>
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 키>
SUPABASE_SERVICE_ROLE_KEY=<service_role 키>
```

## 배포 정보
- **Vercel 프로젝트**: `jaehoon81s-projects/ai-proposal-generator`
- **프로덕션 URL**: https://ai-proposal-generator-livid.vercel.app
- **GitHub 연동**: `Jaehoon81/ai-proposal-generator` → push 시 자동 배포
- **환경변수**: Vercel 대시보드에 4개 설정 완료 (GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

## 주의사항
- `src/app/settings/page.tsx`는 현재 미사용. 프롬프트 기능이 메인 페이지 드롭다운으로 이동됨. 삭제 가능.
- `src/lib/openrouter.ts` 파일명이 openrouter이지만 실제로는 Gemini API를 호출함 (초기에 Openrouter로 설계 후 Gemini로 변경). 리네이밍 고려.
- cheerio 기반 스크래핑은 SPA(JS 렌더링) 사이트에서 내용 추출 불가.
- Gemini 무료 tier에는 rate limit이 있음 (분당 요청 수 제한).
- RLS는 활성화되어 있으나, 회원가입 없이 전역 공유이므로 모든 사용자에게 읽기/쓰기 허용 정책 적용.

## 실행 방법
```bash
npm run dev     # http://localhost:3000
npm run build   # 프로덕션 빌드 검증
npx vercel --prod  # Vercel 프로덕션 수동 배포 (GitHub push 시 자동 배포됨)
```
