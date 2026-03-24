interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <div className={`glass ${hover ? "" : "hover:bg-[var(--surface)] hover:shadow-none"} ${className}`}>
      {children}
    </div>
  );
}
