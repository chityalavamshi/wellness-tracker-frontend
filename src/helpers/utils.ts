export const LS_USER_KEY = "wt_user";
export const LS_ENTRIES_KEY = "wt_entries";

export const moods = ["Happy", "Neutral", "Tired", "Stressed"] as const;
export type Mood = typeof moods[number];

export type Entry = {
  id: string;
  date: string;
  steps: number;
  sleep: number;
  mood: Mood;
  notes?: string;
};

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function offsetDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function lastNDays(entries: Entry[], n: number) {
  const minDate = offsetDate(-n + 1);
  return entries.filter((e) => e.date >= minDate);
}

export function toCSV(rows: Entry[]) {
  const header = ["id", "date", "steps", "sleep", "mood", "notes"];
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = [header.join(",")].concat(
    rows.map((r) =>
      [r.id, r.date, r.steps, r.sleep, r.mood, r.notes ?? ""].map(escape).join(",")
    )
  );
  return lines.join("\n");
}

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

