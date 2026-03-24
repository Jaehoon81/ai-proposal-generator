"use client";

import { useState } from "react";

interface ProposalResultProps {
  content: string;
  isGenerating: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
}

export default function ProposalResult({ content, isGenerating, onSave, onDiscard, isSaving }: ProposalResultProps) {
  const [copied, setCopied] = useState(false);

  if (!content && !isGenerating) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `제안서_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="glass p-6">
      {/* 헤더: 제목 + 작성 중 뱃지 + 복사/다운로드 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
            생성된 제안서
          </h2>
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              작성 중
            </span>
          )}
        </div>

        {content && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  복사됨
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  복사
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              다운로드
            </button>
          </div>
        )}
      </div>

      {/* 제안서 본문 */}
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
        {content}
        {isGenerating && <span className="animate-pulse">▊</span>}
      </div>

      {/* 저장/취소 버튼 — 생성 완료 후에만 표시 */}
      {content && !isGenerating && onSave && onDiscard && (
        <div className="mt-6 flex items-center justify-center gap-3 border-t border-[var(--surface-border)] pt-4">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="rounded-lg px-5 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="btn-primary rounded-lg px-5 py-2 text-sm disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      )}
    </div>
  );
}
