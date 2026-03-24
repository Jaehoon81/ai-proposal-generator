import { NextResponse } from "next/server";
import { generateProposalStream } from "@/lib/openrouter";
import type { GenerateRequest, ApiError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.scrapedContent) {
      return NextResponse.json<ApiError>(
        { error: "스크래핑된 내용이 필요합니다" },
        { status: 400 },
      );
    }

    const stream = await generateProposalStream(
      body.scrapedTitle || "",
      body.scrapedContent,
      body.customPrompt,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "제안서 생성 중 오류가 발생했습니다";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
