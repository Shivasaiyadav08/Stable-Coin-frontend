import { contractsRepositoryUrl } from '@/lib/contracts';

export default function GitHubLink() {
  return (
    <a
      className="github-link"
      href={contractsRepositoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Stable-Coin on GitHub (opens in a new tab)"
      title="Stable-Coin on GitHub"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.773-.244.773-.543 0-.267-.01-1.153-.015-2.093-3.13.68-3.79-1.327-3.79-1.327-.511-1.299-1.249-1.644-1.249-1.644-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.004 1.72 2.634 1.223 3.276.935.102-.727.393-1.223.715-1.505-2.5-.284-5.128-1.25-5.128-5.56 0-1.228.44-2.233 1.16-3.02-.116-.284-.502-1.43.11-2.98 0 0 .945-.303 3.095 1.154a10.8 10.8 0 0 1 5.625 0c2.148-1.457 3.092-1.155 3.092-1.155.614 1.55.228 2.697.112 2.982.722.787 1.158 1.792 1.158 3.02 0 4.32-2.632 5.272-5.14 5.55.404.35.766 1.04.766 2.097 0 1.514-.014 2.735-.014 3.106 0 .302.204.653.774.542A11.25 11.25 0 0 0 12 .75Z" />
      </svg>
    </a>
  );
}
