"use client";

import { useState, useEffect, use } from "react";
import GlassCard from "@/components/ui/GlassCard";
import type { Proposal } from "@/lib/types";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("제안서를 찾을 수 없습니다");
        return res.json();
      })
      .then(setProposal)
      .catch((e) => setError(e.message));
  }, [id]);

  const handleCopy = async () => {
    if (!proposal) return;
    await navigator.clipboard.writeText(proposal.proposal_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!proposal) return;
    const blob = new Blob([proposal.proposal_content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `제안서_${new Date(proposal.created_at).toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl border-red-200/50 bg-red-50/30 p-4 text-sm text-red-600">
          {error}
        </div>
        <a href="/" className="inline-block text-sm text-[var(--accent)] hover:underline">
          ← 메인으로 돌아가기
        </a>
      </div>
    );
  }

  if (!proposal) {
    return (
      <GlassCard className="p-6" hover={false}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-[var(--accent-soft)]" />
          <div className="h-3 w-full rounded bg-[var(--accent-soft)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--accent-soft)]" />
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* 상단 네비게이션 + 메타 정보 */}
      <GlassCard className="px-5 py-4" hover={false}>
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-[var(--accent)] hover:underline">
            ← 메인으로
          </a>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            >
              {copied ? "복사됨" : "복사"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-secondary)]"
            >
              다운로드
            </button>
          </div>
        </div>
        <div className="mt-3">
          <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
            {proposal.scraped_title || "제안서"}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>{new Date(proposal.created_at).toLocaleDateString("ko-KR")}</span>
            <span>·</span>
            <a
              href={proposal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-[var(--accent)]"
            >
              {proposal.url}
            </a>
          </div>
        </div>
      </GlassCard>

      {/* 제안서 본문 */}
      <GlassCard className="p-6" hover={false}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
          {proposal.proposal_content}
        </div>
      </GlassCard>
    </div>
  );
}
