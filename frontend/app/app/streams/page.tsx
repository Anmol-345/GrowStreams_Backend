'use client';

import dynamic from 'next/dynamic';

const StreamsClient = dynamic(() => import('./StreamsClient'), {
  ssr: false,
});

export default function Page() {
  return <StreamsClient />;
}
