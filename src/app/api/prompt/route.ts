import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ApiError } from "@/lib/types";

// 활성 프롬프트 불러오기
export async function GET() {
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("id, content")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 저장된 프롬프트가 없으면 빈 응답
    return NextResponse.json({ content: null });
  }

  return NextResponse.json({ id: data.id, content: data.content });
}

// 프롬프트 저장 (upsert: 활성 프롬프트가 있으면 업데이트, 없으면 생성)
export async function POST(request: Request) {
  const body = await request.json();
  const { content } = body as { content: string };

  if (!content?.trim()) {
    return NextResponse.json<ApiError>(
      { error: "프롬프트 내용이 필요합니다" },
      { status: 400 },
    );
  }

  // 기존 활성 프롬프트 확인
  const { data: existing } = await supabase
    .from("prompt_templates")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (existing) {
    // 기존 프롬프트 업데이트
    const { error } = await supabase
      .from("prompt_templates")
      .update({ content })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: existing.id });
  }

  // 새 프롬프트 생성
  const { data, error } = await supabase
    .from("prompt_templates")
    .insert({ name: "default", content, is_active: true })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
