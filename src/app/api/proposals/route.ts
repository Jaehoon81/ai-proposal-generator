import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SaveProposalRequest, ApiError } from "@/lib/types";

// 제안서 목록 조회 (최신순, 최대 20개)
export async function GET() {
  const { data, error } = await supabase
    .from("proposals")
    .select("id, url, scraped_title, proposal_content, status, created_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 제안서 저장
export async function POST(request: Request) {
  const body = (await request.json()) as SaveProposalRequest;

  if (!body.proposalContent) {
    return NextResponse.json<ApiError>(
      { error: "제안서 내용이 필요합니다" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      url: body.url,
      scraped_title: body.scrapedTitle || null,
      scraped_content: body.scrapedContent,
      proposal_content: body.proposalContent,
      status: "completed",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
