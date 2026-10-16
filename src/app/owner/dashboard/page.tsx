"use client"

import { Card } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/owner/analytics-charts"

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#302A24]">Owner Dashboard</h1>
      <Card className="p-5 border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs rounded-md">
        <AnalyticsCharts />
      </Card>
    </div>
  )
}
