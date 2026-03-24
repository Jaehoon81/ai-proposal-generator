import { NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import type { ScrapeRequest, ScrapeResponse, ApiError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScrapeRequest;

    if (!body.url) {
      return NextResponse.json<ApiError>({ error: "URL이 필요합니다" }, { status: 400 });
    }

    // URL 형식 검증
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json<ApiError>({ error: "올바른 URL 형식이 아닙니다" }, { status: 400 });
    }

    const { title, content } = await scrapeUrl(body.url);

    if (!content) {
      return NextResponse.json<ApiError>(
        { error: "페이지에서 내용을 추출할 수 없습니다" },
        { status: 422 },
      );
    }

    return NextResponse.json<ScrapeResponse>({
      url: body.url,
      title,
      content,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "스크래핑 중 오류가 발생했습니다";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
