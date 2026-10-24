import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container workspace explorer-empty">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>Nothing at this address.</h1>
      <p>Return to the protocol overview or open your workspace.</p>
      <Link href="/" className="button button-primary">
        Back to overview →
      </Link>
    </div>
  );
}
