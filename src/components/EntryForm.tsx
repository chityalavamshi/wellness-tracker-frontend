import React, { useState } from "react";
import type { Entry, Mood } from "../helpers/utils";
import { moods, uid, today } from "../helpers/utils";

interface EntryFormProps {
  onAddEntry: (entry: Entry) => void;
}

export function EntryForm({ onAddEntry }: EntryFormProps) {
  const [steps, setSteps] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);
  const [mood, setMood] = useState<Mood>("Neutral");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      id: uid(),
      date: today(),
      steps,
      sleep,
      mood,
      notes,
    });
    setSteps(0);
    setSleep(0);
    setMood("Neutral");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 shadow-md rounded-md bg-white">
      <h3 className="text-lg font-bold mb-4">Add Entry</h3>
      <input
        type="number"
        placeholder="Steps"
        className="border p-2 rounded w-full mb-2"
        value={steps}
        onChange={(e) => setSteps(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Sleep hours"
        className="border p-2 rounded w-full mb-2"
        value={sleep}
        onChange={(e) => setSleep(Number(e.target.value))}
      />
      <select
        className="border p-2 rounded w-full mb-2"
        value={mood}
        onChange={(e) => setMood(e.target.value as Mood)}
      >
        <option value="Happy">Happy</option>
        <option value="Neutral">Neutral</option>
        <option value="Tired">Tired</option>
        <option value="Stressed">Stressed</option>
      </select>
      <textarea
        placeholder="Notes"
        className="border p-2 rounded w-full mb-2"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="bg-green-500 text-white p-2 rounded w-full" type="submit">
        Add Entry
      </button>
    </form>
  );
}
