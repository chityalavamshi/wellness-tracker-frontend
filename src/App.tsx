import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Moon,
  Sun,
  LogOut,
  Download,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

// --- Utilities ---
const LS_USER_KEY = "wt_user";
const LS_ENTRIES_KEY = "wt_entries";

const moods = ["Happy", "Neutral", "Tired", "Stressed"] as const;
type Mood = typeof moods[number];

type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  sleep: number; // hours
  mood: Mood;
  notes?: string;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function toCSV(rows: Entry[]) {
  const header = ["id", "date", "steps", "sleep", "mood", "notes"];
  const escape = (v: unknown) =>
    `"${String(v ?? "").replaceAll("\"", '""')}"`;
  const lines = [header.join(",")].concat(
    rows.map((r) =>
      [r.id, r.date, r.steps, r.sleep, r.mood, r.notes ?? ""].map(escape).join(",")
    )
  );
  return lines.join("\n");
}

function download(filename: string, text: string) {
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

// --- App ---
export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("wt_dark");
    return saved ? saved === "1" : false;
  });
  const [user, setUser] = useState<null | { email: string }>(() => {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [entries, setEntries] = useState<Entry[]>(() => {
    const raw = localStorage.getItem(LS_ENTRIES_KEY);
    if (raw) return JSON.parse(raw);
    // Seed with a few demo rows
    const seed: Entry[] = [
      { id: uid(), date: today(), steps: 6500, sleep: 7, mood: "Happy", notes: "Good day" },
      { id: uid(), date: offsetDate(-1), steps: 5200, sleep: 6.5, mood: "Neutral" },
      { id: uid(), date: offsetDate(-2), steps: 8000, sleep: 7.5, mood: "Happy" },
      { id: uid(), date: offsetDate(-3), steps: 3000, sleep: 5, mood: "Tired" },
    ];
    return seed;
  });

  const [filter, setFilter] = useState<{ from?: string; to?: string }>({});
  const [editing, setEditing] = useState<Entry | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("wt_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem(LS_ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  }, [user]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => (filter.from ? e.date >= filter.from : true))
      .filter((e) => (filter.to ? e.date <= filter.to : true))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, filter]);

  const latest = entries.slice().sort((a, b) => b.date.localeCompare(a.date))[0] || null;

  function handleSave(form: Partial<Entry>) {
    // Basic validation
    if (!form.date || form.steps == null || form.sleep == null || !form.mood) return;
    if (editing) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...editing, ...form, steps: Number(form.steps), sleep: Number(form.sleep), notes: form.notes ?? "" } as Entry : e))
      );
      setEditing(null);
    } else {
      const newEntry: Entry = {
        id: uid(),
        date: form.date,
        steps: Number(form.steps),
        sleep: Number(form.sleep),
        mood: form.mood as Mood,
        notes: form.notes ?? "",
      } as Entry;
      setEntries((prev) => [...prev, newEntry]);
    }
  }

  function handleEdit(e: Entry) {
    setEditing(e);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  function exportCSV() {
    download("wellness-entries.csv", toCSV(entries));
  }

  // Mock auth handlers
  function login(email: string) {
    setUser({ email });
  }
  function logout() {
    setUser(null);
    localStorage.removeItem(LS_USER_KEY);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wellness Tracker</h1>
            <p className="text-sm opacity-70">Frontend (mocked auth & local storage)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setDark((d) => !d)}
              title="Toggle dark mode"
            >
              <span className="inline-flex items-center gap-2">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{dark ? "Light" : "Dark"}</span>
              </span>
            </button>
            {user && (
              <>
                <button
                  className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={exportCSV}
                  title="Export CSV"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download size={16} /> Export CSV
                  </span>
                </button>
                <button
                  className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={logout}
                  title="Logout"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </span>
                </button>
              </>
            )}
          </div>
        </header>

        {!user ? (
          <AuthCard onLogin={login} />
        ) : (
          <main className="grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <EntryForm
                key={editing?.id ?? "new"}
                initial={editing ?? { date: today(), steps: 0, sleep: 0, mood: "Neutral", notes: "" } as Entry}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                editing={!!editing}
              />

              <EntriesTable
                entries={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                filter={filter}
                setFilter={setFilter}
              />
            </section>

            <section className="space-y-4">
              <Dashboard latest={latest} entries={filtered} />
              <ChartCard entries={filtered} />
            </section>
          </main>
        )}

        <footer className="mt-10 text-center text-xs opacity-60">
          Demo credentials (mocked): any email & password
        </footer>
      </div>
    </div>
  );
}

function AuthCard({ onLogin }: { onLogin: (email: string) => void }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be 6+ chars");
      return;
    }
    setError("");
    onLogin(email);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-2 text-xl font-semibold">{isSignup ? "Create account" : "Welcome back"}</h2>
      <p className="mb-6 text-sm opacity-70">
        {isSignup
          ? "Mock signup: this stores a session locally."
          : "Mock login: any valid email & password works."}
      </p>
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring dark:border-zinc-700 dark:bg-zinc-900"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@wellness.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring dark:border-zinc-700 dark:bg-zinc-900"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Demo123!"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-white shadow hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900">
          <Plus size={16} /> {isSignup ? "Sign up" : "Log in"}
        </button>
        <button
          type="button"
          className="ml-2 text-sm underline opacity-70 hover:opacity-100"
          onClick={() => setIsSignup((s) => !s)}
        >
          {isSignup ? "Have an account? Log in" : "New here? Sign up"}
        </button>
      </form>
    </div>
  );
}

function EntryForm({
  initial,
  onSave,
  onCancel,
  editing,
}: {
  initial: Entry;
  onSave: (e: Partial<Entry>) => void;
  onCancel: () => void;
  editing: boolean;
}) {
  const [date, setDate] = useState(initial.date ?? today());
  const [steps, setSteps] = useState<number>(initial.steps ?? 0);
  const [sleep, setSleep] = useState<number>(initial.sleep ?? 0);
  const [mood, setMood] = useState<Mood>(initial.mood ?? "Neutral");
  const [notes, setNotes] = useState<string>(initial.notes ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ date, steps, sleep, mood, notes });
    if (!editing) {
      // reset
      setDate(today());
      setSteps(0);
      setSleep(0);
      setMood("Neutral");
      setNotes("");
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-lg font-semibold">{editing ? "Edit Entry" : "Add Daily Entry"}</h3>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-sm">Date</label>
          <input
            type="date"
            className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today()}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Steps</label>
          <input
            type="number"
            className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            min={0}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Sleep (hours)</label>
          <input
            type="number"
            step="0.1"
            min={0}
            className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={sleep}
            onChange={(e) => setSleep(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Mood</label>
          <select
            className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={mood}
            onChange={(e) => setMood(e.target.value as Mood)}
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm">Notes (optional)</label>
          <textarea
            className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel today?"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-white shadow hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900">
            <Plus size={16} /> {editing ? "Save changes" : "Add entry"}
          </button>
          {editing && (
            <button
              type="button"
              className="rounded-xl border px-4 py-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function EntriesTable({
  entries,
  onEdit,
  onDelete,
  filter,
  setFilter,
}: {
  entries: Entry[];
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  filter: { from?: string; to?: string };
  setFilter: React.Dispatch<React.SetStateAction<{ from?: string; to?: string }>>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-lg font-semibold">Entries</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs opacity-70">From</label>
            <input
              type="date"
              className="w-[140px] rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={filter.from ?? ""}
              onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value || undefined }))}
              max={filter.to}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs opacity-70">To</label>
            <input
              type="date"
              className="w-[140px] rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={filter.to ?? ""}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value || undefined }))}
              min={filter.from}
              max={today()}
            />
          </div>
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => setFilter({})}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b dark:border-zinc-800">
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Steps</th>
              <th className="py-2 text-left">Sleep</th>
              <th className="py-2 text-left">Mood</th>
              <th className="py-2 text-left">Notes</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td className="py-6 text-center opacity-60" colSpan={6}>
                  No entries in this range.
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b last:border-b-0 dark:border-zinc-800">
                <td className="py-2">{e.date}</td>
                <td className="py-2">{formatNumber(e.steps)}</td>
                <td className="py-2">{e.sleep} h</td>
                <td className="py-2">{e.mood}</td>
                <td className="py-2 max-w-[280px] truncate" title={e.notes}>
                  {e.notes}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      onClick={() => onEdit(e)}
                      title="Edit"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      onClick={() => onDelete(e.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Dashboard({ latest, entries }: { latest: Entry | null; entries: Entry[] }) {
  const days7 = useMemo(() => lastNDays(entries, 7), [entries]);
  const totalSteps7 = days7.reduce((s, e) => s + e.steps, 0);
  const avgSleep7 = days7.length ? (days7.reduce((s, e) => s + e.sleep, 0) / days7.length).toFixed(1) : "0";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-lg font-semibold">Dashboard</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Latest Steps" value={latest ? formatNumber(latest.steps) : "—"} />
        <StatCard label="Latest Sleep" value={latest ? `${latest.sleep} h` : "—"} />
        <StatCard label="Latest Mood" value={latest ? latest.mood : "—"} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatCard label="7‑day Steps" value={formatNumber(totalSteps7)} small />
        <StatCard label="7‑day Avg Sleep" value={`${avgSleep7} h`} small />
      </div>
    </div>
  );
}

function StatCard({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm dark:border-zinc-800 ${small ? "bg-zinc-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"}`}>
      <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function ChartCard({ entries }: { entries: Entry[] }) {
  const data = entries.map((e) => ({ date: e.date, steps: e.steps, sleep: e.sleep }));
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-lg font-semibold">Activity Chart</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="steps" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="sleep" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs opacity-60">Tip: Use the date filters above to focus the chart.</p>
    </div>
  );
}

// --- helpers ---
function offsetDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function lastNDays(entries: Entry[], n: number) {
  const minDate = offsetDate(-n + 1);
  return entries.filter((e) => e.date >= minDate);
}

