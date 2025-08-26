import React from "react";
import type { Entry } from "../helpers/utils";
import { uid, today, moods } from "../helpers/utils";  // runtime values

interface EntriesTableProps {
  entries: Entry[];
}

export function EntriesTable({ entries }: EntriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">Steps</th>
            <th className="py-2 px-4">Sleep</th>
            <th className="py-2 px-4">Mood</th>
            <th className="py-2 px-4">Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b">
              <td className="py-2 px-4">{entry.date}</td>
              <td className="py-2 px-4">{entry.steps}</td>
              <td className="py-2 px-4">{entry.sleep}</td>
              <td className="py-2 px-4">{entry.mood}</td>
              <td className="py-2 px-4">{entry.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
