"use client";

import { useState } from "react";
import type { ScrapeResponse, ApiError } from "@/lib/types";

/** 스트리밍 완료 시 전달되는 스크래핑 정보 */
export interface CompleteInfo {
  url: string;
  title: string;
  content: string;
}

interface UrlInputFormProps {
  onGenerating: (isGenerating: boolean) => void;
  onStream: (chunk: string) => void;
  onComplete: (info: CompleteInfo) => void;
  onError: (error: string) => void;
  customPrompt?: string;
}

export default function UrlInputForm({
  onGenerating,
  onStream,
  onComplete,
  onError,
  customPrompt,
}: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);
    onGenerating(true);
    onError("");

    try {
      // 1단계: URL 스크래핑
      setStatus("분석 중...");
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!scrapeRes.ok) {
        const err = (await scrapeRes.json()) as ApiError;
        throw new Error(err.error);
      }

      const scraped = (await scrapeRes.json()) as ScrapeResponse;

      // 2단계: AI 제안서 생성 (스트리밍)
      setStatus("생성 중...");
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: scraped.url,
          scrapedContent: scraped.content,
          scrapedTitle: scraped.title,
          customPrompt,
        }),
      });

      if (!generateRes.ok) {
        const err = (await generateRes.json()) as ApiError;
        throw new Error(err.error);
      }

      const reader = generateRes.body?.getReader();
      if (!reader) throw new Error("스트림을 읽을 수 없습니다");

      const decoder = new TextDecoder();
      setStatus("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        onStream(text);
      }

      onComplete({ url: scraped.url, title: scraped.title, content: scraped.content });
    } catch (error) {
      const message = error instanceof Error ? error.message : "오류가 발생했습니다";
      onError(message);
    } finally {
      setIsLoading(false);
      setStatus("");
      onGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="glass-input h-11 w-full pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          className={`h-11 whitespace-nowrap rounded-[0.875rem] px-6 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
            isLoading
              ? "bg-[#9B85FC] text-white"
              : "btn-primary"
          }`}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {status || "처리 중..."}
            </span>
          ) : (
            "제안서 생성"
          )}
        </button>
      </div>
    </form>
  );
}
