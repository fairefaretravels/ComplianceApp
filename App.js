import { useState, useEffect } from "react";

// ── Site location for weather lookups (Open-Meteo, no API key needed) ──
// Replace with your business location, or wire per-job geocoding later.
const SITE_LAT = 33.749;
const SITE_LON = -84.388; // Atlanta, GA

const BLUE = { bg: "#e6f1fb", border: "#185fa5", text: "#042c53" };
const AMBER = { bg: "#faeeda", border: "#ba7517", text: "#412402" };
const RED = { bg: "#fcebeb", border: "#a32d2d", text: "#501313" };
const GREEN = { bg: "#eaf3de", border: "#3b6d11", text: "#173404" };
const GRAY = { bg: "#f1efe8", border: "#888780", text: "#2c2c2a" };

const STATUS_COLOR = {
  "rain risk": RED,
  "permit pending": AMBER,
  "inspection booked": BLUE,
  "clear to go": GREEN,
};

// Open-Meteo daily weather codes -> simplified "is it rainy" check
const RAIN_CODES = new Set([
  51, 53, 55, 56, 57, // drizzle
  61, 63, 65, 66, 67, // rain
  80, 81, 82, // rain showers
  95, 96, 99, // thunderstorms
]);

const initialJobs = [
  {
    id: "DCK-0142",
    name: "Henley residence — deck rebuild",
    trade: "decking",
    address: "312 Maple St",
    crew: "Reyes",
    date: "2024-06-17",
    status: "rain risk",
    youtubeId: "",
    compliance: [
      { id: "c1", label: "Ledger flashing inspection", status: "scheduled" },
      { id: "c2", label: "Footing depth vs frost line", status: "passed" },
      { id: "c3", label: "Building permit on file", status: "passed" },
    ],
    notes: [
      { id: "n1", text: "Ledger board flush, owner approved stain color before install.", author: "Reyes", time: "Mon 7:40am" },
      { id: "n2", text: "Inspector pushed ledger inspection to Wednesday morning.", author: "Office", time: "Mon 9:15am" },
    ],
  },
  {
    id: "ROF-0091",
    name: "Castillo roof replacement",
    trade: "roofing",
    address: "88 Birchwood Ave",
    crew: "Okafor",
    date: "2024-06-19",
    status: "permit pending",
    youtubeId: "",
    compliance: [
      { id: "c1", label: "Insurance claim documentation", status: "incomplete" },
      { id: "c2", label: "Fall protection plan on file", status: "passed" },
    ],
    notes: [
      { id: "n1", text: "Adjuster requested 3 more photos of the north slope.", author: "Okafor", time: "Sun 4:05pm" },
    ],
  },
  {
    id: "ELC-0233",
    name: "Park Ave panel upgrade + EV circuit",
    trade: "electrical",
    address: "19 Park Ave",
    crew: "Liang",
    date: "2024-06-20",
    status: "inspection booked",
    youtubeId: "",
    compliance: [
      { id: "c1", label: "NEC panel capacity sign-off", status: "passed" },
      { id: "c2", label: "Licensed electrician on record", status: "passed" },
    ],
    notes: [],
  },
  {
    id: "DCK-0150",
    name: "Greer backyard deck + footings",
    trade: "decking",
    address: "5 Cedar Ln",
    crew: "Reyes",
    date: "2024-06-21",
    status: "clear to go",
    youtubeId: "",
    compliance: [
      { id: "c1", label: "Footing depth vs frost line", status: "passed" },
      { id: "c2", label: "Building permit on file", status: "passed" },
    ],
    notes: [],
  },
];

// The dashboard's sponsor/ad reel — swap this YouTube ID for a real one.
const AD_YOUTUBE_ID = "dQw4w9WgXcQ";

const TABS = ["Dashboard", "Jobs", "Compliance", "Forecast"];

const pill = (label, color) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 500,
      padding: "2px 8px",
      borderRadius: 20,
      background: color.bg,
      color: color.text,
      border: `0.5px solid ${color.border}`,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const complianceColor = (status) =>
  status === "passed" ? GREEN : status === "incomplete" ? RED : status === "scheduled" ? AMBER : GRAY;

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      ...style,
    }}
  >
    {children}
  </div>
);

const MetricCard = ({ label, value, color }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
  </div>
);

// Video box: used for both the dashboard ad/sponsor reel and per-job site videos.
// Pass a youtubeId to embed; otherwise it renders a placeholder.
const VideoBox = ({ youtubeId, label, caption }) => (
  <div
    style={{
      borderRadius: "var(--border-radius-lg)",
      overflow: "hidden",
      background: "var(--color-background-secondary)",
      position: "relative",
      aspectRatio: "16/9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {youtubeId ? (
      <iframe
        title={label || "Video"}
        src={`https://www.youtube.com/embed/${youtubeId}`}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--color-text-secondary)" }}>
        <span style={{ fontSize: 28 }}>▶</span>
        <span style={{ fontSize: 12 }}>{caption || "No video yet"}</span>
      </div>
    )}
    {label && (
      <span
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          fontSize: 11,
          fontWeight: 500,
          padding: "2px 8px",
          borderRadius: 20,
          background: "var(--color-background-primary)",
          color: "var(--color-text-secondary)",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ── Weather hook: pulls a 7-day forecast from Open-Meteo (no key required) ──
function useForecast(lat, lon) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max,weathercode&timezone=auto&forecast_days=7`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather request failed");
        const json = await res.json();
        const days = json.daily.time.map((dateStr, i) => {
          const date = new Date(dateStr + "T00:00:00");
          const pct = json.daily.precipitation_probability_max[i];
          const code = json.daily.weathercode[i];
          return {
            day: date.toLocaleDateString(undefined, { weekday: "short" }),
            date: dateStr,
            pct,
            ok: pct < 40 && !RAIN_CODES.has(code),
          };
        });
        if (!cancelled) {
          setForecast(days);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { forecast, loading, error };
}

export default function FieldOpsApp() {
  const [tab, setTab] = useState("Dashboard");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { forecast, loading: forecastLoading, error: forecastError } = useForecast(SITE_LAT, SITE_LON);

  const [jobs, setJobsRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("fieldops-jobs");
      return saved ? JSON.parse(saved) : initialJobs;
    } catch {
      return initialJobs;
    }
  });

  const setJobs = (updater) => {
    setJobsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("fieldops-jobs", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Re-flag jobs against today's live forecast: if today is wet, jobs scheduled
  // today get bumped into "rain risk" automatically.
  useEffect(() => {
    if (forecast.length === 0) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = forecast.find((f) => f.date === todayStr) || forecast[0];
    if (!today || today.ok) return;
    setJobs((prev) =>
      prev.map((j) => {
        const jobIsToday = j.date === todayStr;
        if (jobIsToday && j.status !== "rain risk") {
          return { ...j, status: "rain risk" };
        }
        return j;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast]);

  const addNote = (jobId, text) => {
    if (!text.trim()) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              notes: [
                ...j.notes,
                {
                  id: `n${j.notes.length + 1}_${Date.now()}`,
                  text,
                  author: "You",
                  time: new Date().toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }),
                },
              ],
            }
          : j
      )
    );
  };

  const rainRiskCount = jobs.filter((j) => j.status === "rain risk").length;
  const permitPendingCount = jobs.filter((j) => j.status === "permit pending").length;
  const inspectionDueCount = jobs.reduce((s, j) => s + j.compliance.filter((c) => c.status === "scheduled").length, 0);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const nextDryDay = forecast.find((f) => f.ok);

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Field Ops</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{jobs.length} active jobs · decking · roofing · electrical</div>
          </div>
          {showResetConfirm ? (
            <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Reset data?</span>
              <button
                onClick={() => {
                  localStorage.removeItem("fieldops-jobs");
                  setJobsRaw(initialJobs);
                  setShowResetConfirm(false);
                }}
                style={{ fontSize: 11, padding: "3px 8px" }}
              >
                Yes
              </button>
              <button onClick={() => setShowResetConfirm(false)} style={{ fontSize: 11, padding: "3px 8px", opacity: 0.5 }}>
                No
              </button>
            </span>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} style={{ fontSize: 11, padding: "4px 10px", opacity: 0.5 }}>
              Reset demo
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: "0.75rem", overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSelectedJobId(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem 0.85rem",
                fontSize: 13,
                color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderBottom: tab === t ? "2px solid var(--color-text-primary)" : "2px solid transparent",
                fontWeight: tab === t ? 500 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.25rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {tab === "Dashboard" && (
          <Dashboard
            jobs={jobs}
            counts={{ rainRiskCount, permitPendingCount, inspectionDueCount }}
            nextDryDay={nextDryDay}
            onSelectJob={(id) => {
              setSelectedJobId(id);
              setTab("Jobs");
            }}
          />
        )}
        {tab === "Jobs" && !selectedJob && <JobList jobs={jobs} onSelectJob={setSelectedJobId} />}
        {tab === "Jobs" && selectedJob && (
          <JobDetail job={selectedJob} forecast={forecast} onBack={() => setSelectedJobId(null)} onAddNote={addNote} />
        )}
        {tab === "Compliance" && <Compliance jobs={jobs} />}
        {tab === "Forecast" && <Forecast forecast={forecast} loading={forecastLoading} error={forecastError} />}
      </div>
    </div>
  );
}

function Dashboard({ jobs, counts, nextDryDay, onSelectJob }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {counts.rainRiskCount > 0 && (
        <div
          style={{
            background: RED.bg,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 500, color: RED.text }}>Today is no good — rain risk on {counts.rainRiskCount} job(s)</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {nextDryDay ? `Next dry window starts ${nextDryDay.day}.` : "Checking the forecast for a dry window..."}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <MetricCard label="Active jobs" value={jobs.length} />
        <MetricCard label="Permit pending" value={counts.permitPendingCount} color={AMBER.border} />
        <MetricCard label="Inspections due" value={counts.inspectionDueCount} color={AMBER.border} />
        <MetricCard label="Weather conflicts" value={counts.rainRiskCount} color={RED.border} />
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Featured / sponsor reel</div>
        <VideoBox youtubeId={AD_YOUTUBE_ID} label="Ad" caption="Sponsor video slot" />
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Today's jobs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jobs.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <span>{j.name}</span>
              {pill(j.status, STATUS_COLOR[j.status] || GRAY)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function JobList({ jobs, onSelectJob }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>
        Jobs <span style={{ color: "var(--color-text-secondary)", fontWeight: 400, fontSize: 13 }}>({jobs.length})</span>
      </div>
      {jobs.map((j) => (
        <Card key={j.id} style={{ cursor: "pointer" }}>
          <div onClick={() => onSelectJob(j.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{j.name}</span>
                {pill(j.status, STATUS_COLOR[j.status] || GRAY)}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                {j.address} · crew: {j.crew} · {j.id}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{j.date}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function JobDetail({ job, forecast, onBack, onAddNote }) {
  const [draft, setDraft] = useState("");
  const nextDryDay = forecast.find((f) => f.ok);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", fontSize: 12, padding: "4px 10px", opacity: 0.7 }}>
        ← Back to jobs
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>{job.name}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {job.address} · crew: {job.crew} · job #{job.id}
          </div>
        </div>
        {pill(job.status, STATUS_COLOR[job.status] || GRAY)}
      </div>

      {job.status === "rain risk" && (
        <div style={{ background: RED.bg, borderRadius: "var(--border-radius-lg)", padding: "0.85rem 1.1rem", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 13, color: RED.text }}>
            Rain risk today. {nextDryDay ? `Next dry window: ${nextDryDay.day}.` : "Checking forecast..."}
          </div>
        </div>
      )}

      <VideoBox youtubeId={job.youtubeId} label="Job video" caption="Site walkthrough" />

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Compliance checklist</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {job.compliance.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}
            >
              <span>{c.label}</span>
              {pill(c.status, complianceColor(c.status))}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Site notes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {job.notes.length === 0 && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No notes yet.</div>}
          {job.notes.map((n) => (
            <div key={n.id} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 13 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
                {n.author} · {n.time}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddNote(job.id, draft);
                setDraft("");
              }
            }}
            placeholder="Add a site note..."
            style={{ flex: 1 }}
          />
          <button
            onClick={() => {
              onAddNote(job.id, draft);
              setDraft("");
            }}
            style={{ whiteSpace: "nowrap" }}
          >
            Add note
          </button>
        </div>
      </Card>
    </div>
  );
}

function Compliance({ jobs }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>Compliance, all jobs</div>
      {jobs.map((j) =>
        j.compliance.map((c) => (
          <Card key={`${j.id}-${c.id}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {j.name} · {j.trade}
                </div>
              </div>
              {pill(c.status, complianceColor(c.status))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function Forecast({ forecast, loading, error }) {
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>7-day rain risk</div>
      {loading && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Loading forecast...</div>}
      {error && <div style={{ fontSize: 12, color: RED.text }}>Couldn't load the forecast ({error}).</div>}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
          {forecast.map((f) => (
            <div
              key={f.date}
              style={{
                background: f.ok ? GREEN.bg : "var(--color-background-secondary)",
                borderRadius: "var(--border-radius-md)",
                padding: "0.75rem 0.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>{f.day}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: f.ok ? GREEN.text : "var(--color-text-primary)" }}>{f.pct}%</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
