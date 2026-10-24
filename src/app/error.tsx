'use client';

import { Feedback } from '@/components/ui/Feedback';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container workspace">
      <Feedback tone="error" title="This page could not be loaded">
        <p>
          Please retry. If a transaction was pending, check its explorer link before submitting
          another action.
        </p>
        <button className="button button-secondary" onClick={reset}>
          Try again
        </button>
      </Feedback>
    </div>
  );
}
