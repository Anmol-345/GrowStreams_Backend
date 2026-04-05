'use client';
import dynamic from 'next/dynamic';

const StreamsClient = dynamic(() => import('./StreamsClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
    </div>
  ),
});

export default function StreamsPage() {
  return <StreamsClient />;
}
