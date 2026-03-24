import * as cheerio from "cheerio";

interface ScrapeResult {
  title: string;
  content: string;
}

/** URL에서 HTML을 가져와 텍스트를 추출한다 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ProposalBot/1.0; +https://proposal-generator.vercel.app)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`페이지를 가져올 수 없습니다: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 불필요한 요소 제거
  $("script, style, nav, footer, header, iframe, noscript, svg").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || "";

  // 본문 텍스트 추출 (주요 콘텐츠 영역 우선)
  const mainSelectors = ["main", "article", '[role="main"]', ".content", "#content"];
  let content = "";

  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length) {
      content = el.text();
      break;
    }
  }

  // 주요 영역을 못 찾으면 body 전체에서 추출
  if (!content) {
    content = $("body").text();
  }

  // 공백 정리: 연속 공백/줄바꿈을 하나로 합침
  content = content.replace(/\s+/g, " ").trim();

  // 토큰 제한을 위해 최대 8000자까지만 사용
  if (content.length > 8000) {
    content = content.slice(0, 8000) + "...";
  }

  return { title, content };
}
