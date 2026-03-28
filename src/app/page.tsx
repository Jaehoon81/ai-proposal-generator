"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import UrlInputForm from "@/components/UrlInputForm";
import type { CompleteInfo } from "@/components/UrlInputForm";
import ProposalResult from "@/components/ProposalResult";
import PromptCustomization, { DEFAULT_PROMPT } from "@/components/PromptCustomization";
import type { Proposal } from "@/lib/types";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [error, setError] = useState("");
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // 초기 다크 모드 상태 동기화
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDark]);

  // 스트리밍 완료 후 스크래핑 정보를 보관 (수동 저장용)
  const scrapeInfoRef = useRef<CompleteInfo | null>(null);

  // 스트리밍 중 누적된 전체 텍스트를 ref로 추적 (DB 저장용)
  const contentRef = useRef("");

  const charCount = proposalContent.length;

  const handleStream = useCallback((chunk: string) => {
    contentRef.current += chunk;
    setProposalContent((prev) => prev + chunk);
  }, []);

  const handleGenerating = useCallback((generating: boolean) => {
    if (generating) {
      setProposalContent("");
      contentRef.current = "";
    }
    setIsGenerating(generating);
  }, []);

  // 최근 제안서 목록 조회
  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals");
      if (res.ok) {
        const data = await res.json();
        setRecentProposals(data);
      }
    } catch {
      // 조회 실패 무시
    }
  }, []);

  // 페이지 로드 시 최근 제안서 조회 + 저장된 프롬프트 불러오기
  useEffect(() => {
    fetchProposals();
    fetch("/api/prompt")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setCustomPrompt(data.content);
      })
      .catch(() => {});
  }, [fetchProposals]);

  // 프롬프트 DB 저장
  const handleSavePrompt = useCallback(async (value: string) => {
    setIsSavingPrompt(true);
    try {
      await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
    } catch {
      // 저장 실패 무시
    } finally {
      setIsSavingPrompt(false);
    }
  }, []);

  // 스트리밍 완료 시 스크래핑 정보만 보관 (자동 저장 안 함)
  const handleComplete = useCallback((info: CompleteInfo) => {
    scrapeInfoRef.current = info;
  }, []);

  // 화면 초기화 (저장/취소 공통)
  const resetView = useCallback(() => {
    setProposalContent("");
    contentRef.current = "";
    scrapeInfoRef.current = null;
    setError("");
    setFormResetKey((k) => k + 1);
  }, []);

  // 수동 저장
  const handleSaveProposal = useCallback(async () => {
    const info = scrapeInfoRef.current;
    if (!info) return;
    setIsSavingProposal(true);
    try {
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: info.url,
          scrapedTitle: info.title,
          scrapedContent: info.content,
          proposalContent: contentRef.current,
        }),
      });
      await fetchProposals();
    } catch {
      // 저장 실패 무시
    } finally {
      setIsSavingProposal(false);
      resetView();
    }
  }, [fetchProposals, resetView]);

  // 제안서 소프트 삭제
  const confirmDeleteProposal = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setRecentProposals((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    } catch {
      // 실패 시 목록 재조회로 복구
      fetchProposals();
    }
  }, [deleteTarget, fetchProposals]);

  // 취소 (저장하지 않고 초기화)
  const handleDiscardProposal = useCallback(() => {
    resetView();
  }, [resetView]);

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <GlassCard className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
            <span className="font-[family-name:var(--font-display)] text-sm font-bold">Ai</span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--text-primary)]">
              Proposal Generator
            </p>
            <p className="text-xs text-[var(--text-muted)]">AI-powered proposal from any URL</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isGenerating ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
            <span className="text-xs text-[var(--text-muted)]">
              {isGenerating ? "Generating" : "Ready"}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            aria-label="다크 모드 전환"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" /><path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" /><path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </GlassCard>

      {/* URL 입력 + 통계 카드 그리드 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* 좌측: URL 입력 */}
        <GlassCard className="p-5" hover={false}>
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
            URL을 입력하세요
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            웹사이트를 분석하여 맞춤형 제안서를 생성합니다.
          </p>
          <div className="mt-4">
            <UrlInputForm
              key={formResetKey}
              onGenerating={handleGenerating}
              onStream={handleStream}
              onComplete={handleComplete}
              onError={setError}
              customPrompt={customPrompt}
            />
          </div>
        </GlassCard>

        {/* 우측: 통계 카드들 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {/* 글자 수 */}
          <GlassCard className="flex items-center gap-3 px-5 py-4" hover={false}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
              </svg>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
                {charCount.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)]">글자 수</p>
            </div>
          </GlassCard>

          {/* 사용 AI 모델 */}
          <GlassCard className="flex items-center gap-3 px-5 py-4" hover={false}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Gemini 2.5 Flash</p>
              <p className="text-xs text-[var(--text-muted)]">Google AI Studio</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="glass rounded-xl border-red-200/50 bg-red-50/30 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 프롬프트 커스터마이징 */}
      <PromptCustomization
        value={customPrompt}
        onChange={setCustomPrompt}
        onSave={handleSavePrompt}
        isSaving={isSavingPrompt}
      />

      {/* 제안서 결과 */}
      <ProposalResult
        content={proposalContent}
        isGenerating={isGenerating}
        onSave={handleSaveProposal}
        onDiscard={handleDiscardProposal}
        isSaving={isSavingProposal}
      />

      {/* 최근 제안서 */}
      {!proposalContent && !isGenerating && (
        <section>
          <hr className="mb-6 border-[var(--surface-border)]" />
          <h2 className="mb-3 text-center font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
            최근 제안서
          </h2>
          {recentProposals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProposals.map((p) => (
                <div key={p.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p.id)}
                    className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
                    aria-label="삭제"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                  <a href={`/proposals/${p.id}`}>
                    <GlassCard className="p-5 pr-10">
                      <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                        {p.scraped_title || p.url}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                        {p.proposal_content.slice(0, 120)}...
                      </p>
                      <p className="mt-3 text-[10px] text-[var(--text-muted)]">
                        {new Date(p.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </GlassCard>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className="p-5" hover={false}>
                    <div className="space-y-3">
                      <div className="h-3 w-3/4 rounded-full bg-[var(--accent-soft)]" />
                      <div className="h-3 w-1/2 rounded-full bg-[var(--accent-soft)]" />
                      <div className="mt-4 h-2 w-1/3 rounded-full bg-[var(--accent-soft)]" />
                    </div>
                  </GlassCard>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
                아직 생성된 제안서가 없습니다. URL을 입력하여 첫 제안서를 만들어보세요.
              </p>
            </>
          )}
        </section>
      )}
      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: isDark ? '#1e1e2e' : '#ffffff',
              border: `1px solid ${isDark ? '#3a3a52' : 'transparent'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: isDark ? '#e2e2e8' : '#111827' }}
            >
              제안서 삭제
            </h3>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: isDark ? '#9d9db5' : '#4b5563' }}
            >
              이 제안서를 삭제하시겠습니까?
              <br />
              삭제된 제안서는 복구할 수 없습니다.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  border: `1px solid ${isDark ? '#4a4a62' : '#d1d5db'}`,
                  background: isDark ? 'transparent' : '#ffffff',
                  color: isDark ? '#c4c4d4' : '#374151',
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDeleteProposal}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
