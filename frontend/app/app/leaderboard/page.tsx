'use client';
import dynamic from "next/dynamic"

const LeaderboardClient = dynamic(() => import("./LeaderboardClient"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
    </div>
  ),
})

export default function LeaderboardPage() {
  return <LeaderboardClient />
}
