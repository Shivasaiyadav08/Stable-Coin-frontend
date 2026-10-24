export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="m20 2 16 9v18l-16 9-7-4 16-9V15L13 6l7-4Z" fill="currentColor" />
      <path d="m11 8 7 4-11 6v8l11 6-7 4L0 30V14l11-6Z" fill="currentColor" opacity=".5" />
      <path d="m20 14 10 6-10 6-10-6 10-6Z" fill="var(--cyan)" />
    </svg>
  );
}
