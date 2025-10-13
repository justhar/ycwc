"use client";

import React, { useState } from "react";

// StudyAbroadApp - Single-file React component UI layout for MVP
// TailwindCSS utility classes used. This is a layout prototype (no backend).
// Default export a React component so it can be previewed.

// Type definitions
interface Profile {
  name: string;
  dob: string;
  nationality: string;
  level: string;
  major: string;
  gpaRaw: string;
  gpaScale: string;
  ielts: string;
  gre: string;
  budget: string;
  startTerm: string;
}

interface FavoriteItem {
  id: number;
  type: string;
  title: string;
  match: number;
}

interface SearchResultItem {
  id: number;
  type: string;
  title: string;
  country: string;
  match: number;
  tuition?: string;
  coverage?: string;
  deadline: string;
}

interface TimelineItem {
  id: number | string;
  text: string;
  date: string;
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export default function StudyAbroadApp() {
  const [view, setView] = useState<string>("hub"); // hub | favorites | timeline | profile | chat | compare
  const [profile, setProfile] = useState<Profile>({
    name: "",
    dob: "",
    nationality: "Indonesia",
    level: "Master",
    major: "Computer Science",
    gpaRaw: "",
    gpaScale: "4.0",
    ielts: "",
    gre: "",
    budget: "medium",
    startTerm: "Fall 2026",
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    { id: 1, type: "univ", title: "NTU - Computer Science", match: 85 },
    { id: 2, type: "scholarship", title: "LPDP - Master's", match: 75 },
  ]);

  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([
    {
      id: 101,
      type: "univ",
      title: "NTU - Computer Science",
      country: "Singapore",
      match: 85,
      tuition: "High",
      deadline: "2026-01-15",
    },
    {
      id: 102,
      type: "univ",
      title: "University of Tokyo - CS",
      country: "Japan",
      match: 80,
      tuition: "Medium",
      deadline: "2026-02-01",
    },
    {
      id: 201,
      type: "scholarship",
      title: "LPDP - Master's",
      country: "Any",
      match: 75,
      coverage: "Full",
      deadline: "2026-03-01",
    },
  ]);

  const addToFavorites = (item: SearchResultItem) => {
    if (!favorites.some((f) => f.id === item.id))
      setFavorites([
        ...favorites,
        { id: item.id, type: item.type, title: item.title, match: item.match },
      ]);
  };

  const removeFavorite = (id: number) =>
    setFavorites(favorites.filter((f) => f.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">StudyAway — MVP Layout</h1>
          <nav className="flex gap-2">
            <NavButton
              label="Hub"
              active={view === "hub"}
              onClick={() => setView("hub")}
            />
            <NavButton
              label="Favorites"
              active={view === "favorites"}
              onClick={() => setView("favorites")}
            />
            <NavButton
              label="Timeline"
              active={view === "timeline"}
              onClick={() => setView("timeline")}
            />
            <NavButton
              label="Chat"
              active={view === "chat"}
              onClick={() => setView("chat")}
            />
            <NavButton
              label="Compare"
              active={view === "compare"}
              onClick={() => setView("compare")}
            />
            <NavButton
              label="Profile"
              active={view === "profile"}
              onClick={() => setView("profile")}
            />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: Profile & Quick Stats (col-span-1 on lg) */}
        <aside className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <ProfileCard profile={profile} onEdit={() => setView("profile")} />

          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setView("hub")} className="btn">
                Search Programs
              </button>
              <button
                onClick={() => setView("timeline")}
                className="btn-outline"
              >
                Open Timeline
              </button>
              <button onClick={() => setView("chat")} className="btn-outline">
                Ask Chatbot
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2">Favorites Preview</h3>
            <ul className="space-y-2">
              {favorites.slice(0, 3).map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-slate-500">
                      {f.type.toUpperCase()} • Match {f.match}%
                    </div>
                  </div>
                  <button
                    className="text-xs text-rose-500"
                    onClick={() => removeFavorite(f.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {favorites.length === 0 && (
                <li className="text-xs text-slate-500">No favorites yet</li>
              )}
            </ul>
          </div>
        </aside>

        {/* RIGHT: Main Content (col-span-3 on lg) */}
        <section className="lg:col-span-3 space-y-6">
          {view === "hub" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">Program Hub</h2>
              <p className="text-sm text-slate-500 mb-4">
                Pilih mau nyari universitas or scholarship — hasil akan personal
                sesuai profile.
              </p>

              <SearchBar onSearch={(q: string) => console.log("search", q)} />

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((r) => (
                  <ProgramCard
                    key={r.id}
                    item={r}
                    onSave={() => addToFavorites(r)}
                  />
                ))}
              </div>
            </div>
          )}

          {view === "favorites" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">Favorites / Shortlist</h2>
              <p className="text-sm text-slate-500 mb-4">
                Simpan program yang kamu suka. Dari sini bisa generate timeline
                otomatis.
              </p>

              <div className="space-y-3">
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between border rounded p-3"
                  >
                    <div>
                      <div className="font-medium">{f.title}</div>
                      <div className="text-xs text-slate-500">
                        {f.type} • Match {f.match}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-sm"
                        onClick={() => setView("timeline")}
                      >
                        Make Timeline
                      </button>
                      <button
                        className="text-sm text-rose-500"
                        onClick={() => removeFavorite(f.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No favorites yet — start searching.
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "timeline" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">AI-generated Timeline</h2>
              <p className="text-sm text-slate-500 mb-4">
                Timeline dibuat dari favorites + deadlines. Ini versi MVP
                sederhana.
              </p>

              <TimelineView favorites={favorites} profile={profile} />
            </div>
          )}

          {view === "profile" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-slate-500 mb-4">
                Isi data biar hasil match lebih akurat.
              </p>
              <ProfileForm
                profile={profile}
                onChange={setProfile}
                onSave={() => alert("Saved (stub)")}
              />
            </div>
          )}

          {view === "chat" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">Chatbot</h2>
              <p className="text-sm text-slate-500 mb-4">
                Tanya soal deadlines, SOP, atau minta draft cepat.
              </p>
              <ChatbotStub />
            </div>
          )}

          {view === "compare" && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">Compare — Country / Uni</h2>
              <p className="text-sm text-slate-500 mb-4">
                Bandingin dua negara (cost, visa, job prospects). Low-priority
                fitur.
              </p>
              <CompareStub />
            </div>
          )}
        </section>
      </main>

      <footer className="text-center p-4 text-xs text-slate-500">
        Prototype UI • Tailwind layout • MVP-focused
      </footer>
    </div>
  );
}

/* ---------- Small UI components used in layout ---------- */

interface NavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${
        active ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

interface ProfileCardProps {
  profile: Profile;
  onEdit: () => void;
}

function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm">
          {profile.name ? profile.name[0] : "U"}
        </div>
        <div>
          <div className="font-medium">{profile.name || "Nama Baru"}</div>
          <div className="text-xs text-slate-500">
            {profile.level} • {profile.major}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-600">
        <div>
          GPA: {profile.gpaRaw || "-"} ({profile.gpaScale})
        </div>
        <div>English: {profile.ielts || "-"}</div>
      </div>
      <div className="mt-3">
        <button onClick={onEdit} className="btn w-full">
          Edit Profile
        </button>
      </div>
    </div>
  );
}

interface SearchBarProps {
  onSearch: (query: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [q, setQ] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search university or scholarship"
        className="flex-1 rounded border p-2"
      />
      <button className="btn" onClick={() => onSearch(q)}>
        Search
      </button>
    </div>
  );
}

interface ProgramCardProps {
  item: SearchResultItem;
  onSave: () => void;
}

function ProgramCard({ item, onSave }: ProgramCardProps) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-xs text-slate-500">
            {item.type} • {item.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{item.match}%</div>
          <div className="text-xs text-slate-400">Match</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          Deadline: {item.deadline || "N/A"}
        </div>
        <div className="flex gap-2">
          <button onClick={onSave} className="btn-sm">
            Save
          </button>
          <button className="btn-outline-sm">Details</button>
        </div>
      </div>
    </div>
  );
}

interface TimelineViewProps {
  favorites: FavoriteItem[];
  profile: Profile;
}

function TimelineView({ favorites, profile }: TimelineViewProps) {
  // Simple deterministic timeline generator for MVP preview
  const base: TimelineItem[] = [];
  if (favorites.length === 0) {
    base.push({
      id: "t-start",
      text: "Add favorites to generate timeline",
      date: "-",
    });
  } else {
    base.push({
      id: 1,
      text: "Finalize target univ & scholarships",
      date: "6+ months before",
    });
    base.push({
      id: 2,
      text: "Register English test (IELTS/TOEFL)",
      date: "5 months before",
    });
    base.push({ id: 3, text: "Draft CV & SOP v1", date: "4 months before" });
    base.push({ id: 4, text: "Ask referees for LOR", date: "3 months before" });
    base.push({
      id: 5,
      text: "Format & translate transcripts",
      date: "2 months before",
    });
    base.push({
      id: 6,
      text: "Final check & submit applications",
      date: "2 weeks before",
    });
  }

  return (
    <div>
      <div className="space-y-3">
        {base.map((b) => (
          <div key={b.id} className="flex items-start gap-3 border rounded p-3">
            <div className="w-12 text-xs text-slate-500">{b.date}</div>
            <div className="flex-1">
              <div className="font-medium">{b.text}</div>
              <div className="text-xs text-slate-500 mt-1">
                Quick action:{" "}
                <button className="text-sm underline">Generate SOP</button>
              </div>
            </div>
            <div className="text-sm text-slate-400">Status: Not started</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button className="btn">Export to Google Calendar</button>
      </div>
    </div>
  );
}

interface ProfileFormProps {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onSave: () => void;
}

function ProfileForm({ profile, onChange, onSave }: ProfileFormProps) {
  const update = (k: keyof Profile, v: string) =>
    onChange({ ...profile, [k]: v });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={profile.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Full name"
          className="p-2 rounded border"
        />
        <input
          value={profile.dob}
          onChange={(e) => update("dob", e.target.value)}
          placeholder="DOB (YYYY-MM-DD)"
          className="p-2 rounded border"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <select
          value={profile.level}
          onChange={(e) => update("level", e.target.value)}
          className="p-2 rounded border"
        >
          <option>Undergrad</option>
          <option>Master</option>
          <option>PhD</option>
        </select>
        <input
          value={profile.major}
          onChange={(e) => update("major", e.target.value)}
          placeholder="Intended major"
          className="p-2 rounded border"
        />
        <input
          value={profile.gpaRaw}
          onChange={(e) => update("gpaRaw", e.target.value)}
          placeholder="GPA / %"
          className="p-2 rounded border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={profile.ielts}
          onChange={(e) => update("ielts", e.target.value)}
          placeholder="IELTS / TOEFL"
          className="p-2 rounded border"
        />
        <input
          value={profile.gre}
          onChange={(e) => update("gre", e.target.value)}
          placeholder="GRE / GMAT"
          className="p-2 rounded border"
        />
        <select
          value={profile.budget}
          onChange={(e) => update("budget", e.target.value)}
          className="p-2 rounded border"
        >
          <option value="low">Low budget</option>
          <option value="medium">Medium</option>
          <option value="high">High / No limit</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button className="btn">Save</button>
        <button
          type="button"
          className="btn-outline"
          onClick={() =>
            onChange({
              name: "",
              dob: "",
              nationality: "Indonesia",
              level: "Master",
              major: "Computer Science",
              gpaRaw: "",
              gpaScale: "4.0",
              ielts: "",
              gre: "",
              budget: "medium",
              startTerm: "Fall 2026",
            })
          }
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function ChatbotStub() {
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi! Mau tanya apa tentang study abroad?" },
  ]);
  const [q, setQ] = useState<string>("");
  const send = () => {
    if (!q) return;
    setHistory([
      ...history,
      { role: "user", text: q },
      {
        role: "bot",
        text: "Response stub: AI would answer here and link to features.",
      },
    ]);
    setQ("");
  };
  return (
    <div>
      <div className="border rounded p-3 h-56 overflow-y-auto bg-slate-50">
        {history.map((h, i) => (
          <div
            key={i}
            className={`mb-2 ${h.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-2 rounded ${
                h.role === "user"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {h.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 p-2 rounded border"
        />
        <button className="btn" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}

function CompareStub() {
  const [a, setA] = useState("Singapore");
  const [b, setB] = useState("Japan");
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <select
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="p-2 rounded border"
        >
          <option>Singapore</option>
          <option>Japan</option>
          <option>Australia</option>
          <option>UK</option>
          <option>Canada</option>
        </select>
        <select
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="p-2 rounded border"
        >
          <option>Japan</option>
          <option>Singapore</option>
          <option>Australia</option>
          <option>UK</option>
          <option>Canada</option>
        </select>
        <button className="btn">Compare</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-white">
          <h4 className="font-semibold">{a}</h4>
          <ul className="text-sm text-slate-600 mt-2">
            <li>Cost: High</li>
            <li>Visa: Moderate</li>
            <li>Post-study work: Good</li>
          </ul>
        </div>
        <div className="border rounded p-3 bg-white">
          <h4 className="font-semibold">{b}</h4>
          <ul className="text-sm text-slate-600 mt-2">
            <li>Cost: Medium</li>
            <li>Visa: Strict</li>
            <li>Post-study work: Limited</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- small utility classes (like btn) ---------- */

// The following CSS classes are referenced (btn, btn-outline, etc). In a real project map them to Tailwind or components.
// Example Tailwind utilities: .btn => px-3 py-1 rounded bg-slate-800 text-white
