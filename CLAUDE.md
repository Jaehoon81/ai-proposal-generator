# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 명령어

```bash
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 빌드된 앱 실행
npm run lint      # ESLint
npx vercel --prod # Vercel 프로덕션 수동 배포 (GitHub push 시 자동 배포됨)
```

## 아키텍처

Next.js 16.2.1 App Router 기반. 모든 페이지는 `src/app/` 아래 위치. 경로 alias `@/*` → `./src/*`.

### 핵심 플로우

```
URL 입력 → POST /api/scrape (cheerio HTML 파싱, 8000자 제한)
         → POST /api/generate (Gemini 2.5 Flash SSE 스트리밍 → ReadableStream으로 클라이언트 전달)
         → 실시간 화면 표시 (page.tsx에서 useState + useRef로 스트리밍 누적)
         → "저장" 클릭 시 POST /api/proposals → Supabase 저장 + 목록 갱신
         → "취소" 클릭 시 저장 없이 초기화
```

### 상태 관리

외부 상태 라이브러리 없이 React hooks만 사용. `page.tsx`가 모든 상태를 관리하고 자식 컴포넌트에 props로 전달.
- `contentRef` (useRef): 스트리밍 중 전체 텍스트 누적 (DB 저장용)
- `scrapeInfoRef` (useRef): 스크래핑 메타데이터 보관 (수동 저장 시 사용)
- `formResetKey`: UrlInputForm의 key prop으로 컴포넌트 리마운트하여 입력 초기화

### API 패턴

모든 API 라우트는 `src/app/api/` 아래. 에러 응답 형식: `{ error: string }`.
- `/api/generate`의 스트리밍: Gemini API SSE 응답을 파싱하여 `ReadableStream`으로 재전달
- `/api/proposals`의 소프트 삭제: `is_deleted` 플래그 (실제 DELETE 아님)
- `/api/prompt`의 upsert: `is_active=true`인 레코드를 찾아 업데이트, 없으면 새로 생성

### 디자인 시스템

CSS 변수 기반 라이트/다크 모드 (`globals.css`). 퍼플 톤 액센트(`--accent: #7C5CFC`).
다크 모드 깜박임 방지를 위해 `layout.tsx`의 `<head>`에 인라인 스크립트로 페인트 전 `.dark` 클래스 적용.

## 주의사항

- `src/lib/openrouter.ts` 파일명이 openrouter이지만 실제로는 Gemini API를 호출함 (초기 설계 잔재). 리네이밍 고려.
- `src/app/settings/page.tsx`는 미사용. 프롬프트 기능이 메인 페이지로 이동됨. 삭제 가능.
- cheerio 기반 스크래핑은 SPA(JS 렌더링) 사이트에서 내용 추출 불가.
- Gemini 무료 tier rate limit 존재 (분당 요청 수 제한).
- Supabase RLS 활성화 상태이나, 회원가입 없는 전역 공유이므로 모든 사용자에게 읽기/쓰기 허용 정책 적용 중.
