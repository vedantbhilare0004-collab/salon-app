"use client";

import { Card } from "@/components/ui/card";
import { BarChart } from "recharts";
import { Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Placeholder data - will be replaced with real analytics later
const dummyData = [
  { name: "Mon", appointments: 12 },
  { name: "Tue", appointments: 8 },
  { name: "Wed", appointments: 15 },
  { name: "Thu", appointments: 7 },
  { name: "Fri", appointments: 10 },
];

export function AnalyticsCharts() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#302A24]">Appointments per Day</h2>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dummyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#74695E" fontSize={12} tickLine={false} axisLine={{ stroke: "#E9E1D6" }} />
            <YAxis stroke="#74695E" fontSize={12} tickLine={false} axisLine={{ stroke: "#E9E1D6" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFDFA",
                borderColor: "#E9E1D6",
                borderRadius: "6px",
                color: "#302A24",
                fontSize: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
              }}
            />
            <Bar dataKey="appointments" fill="#A27C48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
