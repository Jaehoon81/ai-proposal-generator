-- 제안서 테이블
create table proposals (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  scraped_title text,
  scraped_content text not null,
  proposal_content text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

-- 최신순 조회를 위한 인덱스
create index idx_proposals_created_at on proposals (created_at desc);

-- 프롬프트 템플릿 테이블
create table prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'default',
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS 비활성화 (회원가입 없이 전역 공유)
alter table proposals enable row level security;
alter table prompt_templates enable row level security;

-- 모든 사용자 읽기/쓰기 허용
create policy "proposals_all" on proposals for all using (true) with check (true);
create policy "prompt_templates_all" on prompt_templates for all using (true) with check (true);
