import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ApiError } from "@/lib/types";

// 제안서 단건 조회
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json<ApiError>(
      { error: "제안서를 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}

// 소프트 삭제 (is_deleted 플래그 변경)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { error } = await supabase
    .from("proposals")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
