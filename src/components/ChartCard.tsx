import React from "react";
import type { Entry } from "../helpers/utils";

interface ChartCardProps {
  title: string;
  data: Entry[];
  dataKey: "steps" | "sleep";
}

export function ChartCard({ title, data = [], dataKey }: ChartCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div>
        {data.map((e) => (
          <div key={e.id} className="flex justify-between border-b py-1">
            <span>{e.date}</span>
            <span>{e[dataKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

