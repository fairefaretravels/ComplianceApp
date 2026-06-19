import { useState } from "react";

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

const initialData = {
  jobs: [
    {
      id: "DCK-0142",
      name: "Henley residence — deck rebuild",
      trade: "decking",
      address: "312 Maple St",
      crew: "Reyes",
      date: "2024-06-17",
      status: "rain risk",
      videoUrl: "",
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
      videoUrl: "",
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
      videoUrl: "",
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
      videoUrl: "",
      compliance: [
        { id: "c1", label: "Footing depth vs frost line", status: "passed" },
        { id: "c2", label: "Building permit on file", status: "passed" },
      ],
      notes: [],
    },
  ],
  forecast: [
    { day: "Mon", pct: 70, ok: false },
    { day: "Tue", pct: 40, ok: false },
    { day: "Wed", pct: 5, ok: true },
    { day: "Thu", pct: 5, ok: true },
    { day: "Fri", pct: 10, ok: true },
    { day: "Sat", pct: 10, ok: true },
    { day: "Sun", pct: 35, ok: false },
  ],
};

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

// Video box: used for both ad reels (dashboard) and job-site walkthroughs (job detail).
// Pass a videoUrl to embed an actual <video>/<iframe>; otherwise it renders a placeholder.
const VideoBox = ({ videoUrl, label, caption }) => (
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
    {videoUrl ? (
      <video src={videoUrl} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
        }}
      >
        {label}
      </span>
    )}
  </div>
);

export default function FieldOpsApp() {
  const [tab, setTab] = useState("Dashboard");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [data, setDataRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("fieldops-data");
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const setData = (updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("fieldops-data", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addNote = (jobId, text) => {
    if (!text.trim()) return;
    setData((d) => ({
      ...d,
      jobs: d.jobs.map((j) =>
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
      ),
    }));
  };

  const rainRiskCount = data.jobs.filter((j) => j.status === "rain risk").length;
  const permitPendingCount = data.jobs.filter((j) => j.status === "permit pending").length;
  const inspectionDueCount = data.jobs.reduce(
    (s, j) => s + j.compliance.filter((c) => c.status === "scheduled").length,
    0
  );

  const selectedJob = data.jobs.find((j) => j.id === selectedJobId);

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Field Ops</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{data.jobs.length} active jobs · decking · roofing · electrical</div>
          </div>
          {showResetConfirm ? (
            <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Reset data?</span>
              <button
                onClick={() => {
                  localStorage.removeItem("fieldops-data");
                  setDataRaw(initialData);
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
        {tab === "Dashboard" && <Dashboard data={data} counts={{ rainRiskCount, permitPendingCount, inspectionDueCount }} onSelectJob={(id) => { setSelectedJobId(id); setTab("Jobs"); }} />}
        {tab === "Jobs" && !selectedJob && <JobList data={data} onSelectJob={setSelectedJobId} />}
        {tab === "Jobs" && selectedJob && <JobDetail job={selectedJob} onBack={() => setSelectedJobId(null)} onAddNote={addNote} />}
        {tab === "Compliance" && <Compliance data={data} />}
        {tab === "Forecast" && <Forecast data={data} />}
      </div>
    </div>
  );
}

function Dashboard({ data, counts, onSelectJob }) {
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
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Next dry window: Wed–Sat.</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <MetricCard label="Active jobs" value={data.jobs.length} />
        <MetricCard label="Permit pending" value={counts.permitPendingCount} color={AMBER.border} />
        <MetricCard label="Inspections due" value={counts.inspectionDueCount} color={AMBER.border} />
        <MetricCard label="Weather conflicts" value={counts.rainRiskCount} color={RED.border} />
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Featured / sponsor reel</div>
        <VideoBox label="Ad" caption="Sponsor video slot" />
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Today's jobs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.jobs.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", fontSize: 13 }}
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

function JobList({ data, onSelectJob }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>Jobs <span style={{ color: "var(--color-text-secondary)", fontWeight: 400, fontSize: 13 }}>({data.jobs.length})</span></div>
      {data.jobs.map((j) => (
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

function JobDetail({ job, onBack, onAddNote }) {
  const [draft, setDraft] = useState("");

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

      <VideoBox videoUrl={job.videoUrl} label="Job video" caption="Site walkthrough" />

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Compliance checklist</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {job.compliance.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
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

function Compliance({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>Compliance, all jobs</div>
      {data.jobs.map((j) =>
        j.compliance.map((c) => (
          <Card key={`${j.id}-${c.id}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{j.name} · {j.trade}</div>
              </div>
              {pill(c.status, complianceColor(c.status))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function Forecast({ data }) {
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>7-day rain risk</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
        {data.forecast.map((f) => (
          <div
            key={f.day}
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
    </Card>
  );
}
