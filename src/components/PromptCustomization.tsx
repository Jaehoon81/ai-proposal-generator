"use client";

import { useState } from "react";

const DEFAULT_PROMPT = `당신은 전문 제안서 작성 전문가입니다. 다음 웹페이지 내용을 분석하여 체계적인 제안서를 작성해주세요.

## 작성 규칙
- 마크다운 형식으로 작성
- 구조: 개요 → 현황 분석 → 제안 내용 → 기대 효과 → 결론
- 핵심 포인트를 bullet point로 정리
- 전문적이고 설득력 있는 톤 유지
- 한국어로 작성

## 웹페이지 제목
{{title}}

## 웹페이지 내용
{{content}}`;

interface PromptCustomizationProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  isSaving?: boolean;
}

export default function PromptCustomization({ value, onChange, onSave, isSaving }: PromptCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onChange(DEFAULT_PROMPT);
  };

  return (
    <div className="glass overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
      >
        {/* 편집 아이콘 */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--text-muted)]">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
          프롬프트 커스터마이징
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-[var(--surface-border)] px-5 py-4">
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            {"{{title}}"} 과 {"{{content}}"} 플레이스홀더는 스크래핑 결과로 자동 치환됩니다.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="glass-input min-h-[180px] w-full resize-y p-3 text-xs leading-relaxed text-[var(--text-primary)] font-mono"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            >
              기본값으로 초기화
            </button>
            <button
              type="button"
              onClick={() => onSave?.(value)}
              disabled={isSaving}
              className="btn-primary rounded-lg px-4 py-1.5 text-xs disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_PROMPT };
