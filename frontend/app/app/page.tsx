'use client';
import dynamic from "next/dynamic"

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
    </div>
  ),
})

export default function DashboardPage() {
  return <DashboardClient />
}
