import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="p-4 shadow-md rounded-md bg-white text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-500">{title}</div>
    </div>
  );
}

interface DashboardProps {
  totalSteps: number;
  avgSleep: number;
  happyDays: number;
}

export function Dashboard({ totalSteps, avgSleep, happyDays }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard title="Total Steps" value={totalSteps} />
      <StatCard title="Average Sleep" value={avgSleep} />
      <StatCard title="Happy Days" value={happyDays} />
    </div>
  );
}
