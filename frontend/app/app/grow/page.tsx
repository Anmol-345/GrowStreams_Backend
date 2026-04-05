'use client';
import dynamic from "next/dynamic"

const GrowClient = dynamic(() => import("./GrowClient"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
    </div>
  ),
})

export default function GrowTokenPage() {
  return <GrowClient />
}
