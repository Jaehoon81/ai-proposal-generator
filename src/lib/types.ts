/** 스크래핑 API 요청 */
export interface ScrapeRequest {
  url: string;
}

/** 스크래핑 API 응답 */
export interface ScrapeResponse {
  url: string;
  title: string;
  content: string;
}

/** 제안서 생성 API 요청 */
export interface GenerateRequest {
  url: string;
  scrapedContent: string;
  scrapedTitle: string;
  customPrompt?: string;
}

/** DB에 저장된 제안서 */
export interface Proposal {
  id: string;
  url: string;
  scraped_title: string | null;
  scraped_content: string;
  proposal_content: string;
  status: string;
  created_at: string;
}

/** 제안서 저장 요청 */
export interface SaveProposalRequest {
  url: string;
  scrapedTitle: string;
  scrapedContent: string;
  proposalContent: string;
}

/** API 에러 응답 */
export interface ApiError {
  error: string;
}
