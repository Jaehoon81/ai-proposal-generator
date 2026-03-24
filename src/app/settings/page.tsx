import GlassCard from "@/components/ui/GlassCard";

export default function SettingsPage() {
  return (
    <div className="mt-8 space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        설정
      </h1>

      <GlassCard className="p-6" hover={false}>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
          프롬프트 템플릿
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          AI가 제안서를 생성할 때 사용하는 프롬프트를 수정할 수 있습니다.
        </p>
        <textarea
          className="glass-input min-h-[200px] w-full resize-y p-4 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          placeholder="프롬프트 템플릿을 입력하세요..."
          disabled
        />
        <div className="mt-4 flex justify-end">
          <button className="btn-primary text-sm" disabled>
            저장
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
