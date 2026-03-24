/** 기본 프롬프트 템플릿 (Supabase 연동 전까지 사용) */
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

/** Gemini API를 호출하여 스트리밍 응답을 반환한다 */
export async function generateProposalStream(
  scrapedTitle: string,
  scrapedContent: string,
  customPrompt?: string,
): Promise<ReadableStream> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다");
  }

  // 프롬프트 템플릿에 스크래핑 데이터 삽입
  const template = customPrompt || DEFAULT_PROMPT;
  const prompt = template
    .replace("{{title}}", scrapedTitle)
    .replace("{{content}}", scrapedContent);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} - ${errorBody}`);
  }

  if (!response.body) {
    throw new Error("응답 스트림을 받지 못했습니다");
  }

  // Gemini SSE 스트림을 텍스트 스트림으로 변환
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        controller.close();
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();

        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }
    },
  });
}
