type Props = {
  title: string;
  pillLabel?: string;
};

export function SectionHeader({ title, pillLabel }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-title-3 text-fg-primary">{title}</h2>
      {pillLabel && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-point-50 px-3 py-1 text-caption-1 font-bold text-fg-point">
          <span className="size-1.5 rounded-full bg-point-500" aria-hidden />
          {pillLabel}
        </span>
      )}
    </div>
  );
}
