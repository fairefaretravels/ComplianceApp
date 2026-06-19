import { useState, useEffect } from "react";

const AMBER = { bg: "#faeeda", border: "#ba7517", text: "#633806", mid: "#ef9f27", dark: "#412402" };
const TEAL = { bg: "#e1f5ee", border: "#0f6e56", text: "#085041", mid: "#1d9e75" };
const CORAL = { bg: "#faece7", border: "#993c1d", text: "#4a1b0c", mid: "#d85a30" };
const BLUE = { bg: "#e6f1fb", border: "#185fa5", text: "#042c53", mid: "#378add" };
const GREEN = { bg: "#eaf3de", border: "#3b6d11", text: "#173404", mid: "#639922" };

const initialData = {
  hives: [
    { id: "H01", name: "Meadow Queen", location: "North Apiary", queenYear: 2023, strength: "strong", lastInspected: "2024-05-12", notes: "Excellent population, calm temperament" },
    { id: "H02", name: "Clover Crown", location: "North Apiary", queenYear: 2022, strength: "medium", lastInspected: "2024-05-10", notes: "Slight Varroa presence, treated" },
    { id: "H03", name: "Wildflower", location: "South Apiary", queenYear: 2024, strength: "strong", lastInspected: "2024-05-14", notes: "New queen this spring, building well" },
    { id: "H04", name: "River Bend", location: "South Apiary", queenYear: 2021, strength: "weak", lastInspected: "2024-05-08", notes: "May need requeening" },
    { id: "H05", name: "Sunflower", location: "East Field", queenYear: 2023, strength: "strong", lastInspected: "2024-05-13", notes: "Heavy nectar flow, add super soon" },
    { id: "H06", name: "Buckwheat", location: "East Field", queenYear: 2023, strength: "medium", lastInspected: "2024-05-11", notes: "Normal activity" },
  ],
  harvests: [
    { id: "HAR01", date: "2024-04-20", hiveId: "H01", rawLbs: 42, type: "Spring Wildflower", notes: "Light golden, excellent clarity" },
    { id: "HAR02", date: "2024-04-20", hiveId: "H03", rawLbs: 38, type: "Spring Wildflower", notes: "Very aromatic" },
    { id: "HAR03", date: "2024-04-22", hiveId: "H05", rawLbs: 51, type: "Spring Wildflower", notes: "Record yield" },
    { id: "HAR04", date: "2023-08-15", hiveId: "H01", rawLbs: 67, type: "Summer Clover", notes: "" },
    { id: "HAR05", date: "2023-08-15", hiveId: "H02", rawLbs: 44, type: "Summer Clover", notes: "" },
  ],
  products: [
    { id: "PRD01", name: "Raw Honey 12oz", type: "honey", harvestId: "HAR03", unitsProduced: 68, unitsSold: 45, pricePerUnit: 14, costPerUnit: 4.2 },
    { id: "PRD02", name: "Beeswax Candles (pair)", type: "candle", harvestId: "HAR01", unitsProduced: 24, unitsSold: 18, pricePerUnit: 22, costPerUnit: 6.5 },
    { id: "PRD03", name: "Lip Balm Set x3", type: "cosmetic", harvestId: "HAR01", unitsProduced: 60, unitsSold: 52, pricePerUnit: 12, costPerUnit: 2.8 },
    { id: "PRD04", name: "Creamed Honey 8oz", type: "honey", harvestId: "HAR02", unitsProduced: 40, unitsSold: 30, pricePerUnit: 11, costPerUnit: 3.5 },
    { id: "PRD05", name: "Propolis Tincture", type: "supplement", harvestId: "HAR04", unitsProduced: 30, unitsSold: 28, pricePerUnit: 18, costPerUnit: 5.0 },
  ],
  treatments: [
    { id: "TRT01", hiveId: "H02", date: "2024-05-01", type: "Oxalic Acid", reason: "Varroa mite control", nextDue: "2024-08-01", status: "complete" },
    { id: "TRT02", hiveId: "H04", date: "2024-05-08", type: "Apivar Strip", reason: "Varroa mite control", nextDue: "2024-08-08", status: "complete" },
    { id: "TRT03", hiveId: "H01", date: "2024-08-01", type: "Oxalic Acid", reason: "Preventive", nextDue: "2024-11-01", status: "scheduled" },
    { id: "TRT04", hiveId: "H05", date: "2024-08-01", type: "Apivar Strip", reason: "Varroa mite control", nextDue: "2024-11-01", status: "scheduled" },
  ],
  buyers: [
    { id: "BUY01", name: "Harvest Table Restaurant", contact: "Lisa Park", email: "lisa@harvesttable.com", phone: "404-555-0182", type: "restaurant" },
    { id: "BUY02", name: "Green Roots Co-op", contact: "Marcus Webb", email: "m.webb@greenroots.coop", phone: "404-555-0241", type: "wholesale" },
    { id: "BUY03", name: "Piedmont Farmers Market", contact: "Direct sales", email: "market@piedmont.org", phone: "", type: "market" },
  ],
  orders: [
    { id: "ORD01", buyerId: "BUY01", date: "2024-05-15", status: "fulfilled", items: [{ productId: "PRD01", qty: 12 }, { productId: "PRD03", qty: 8 }], notes: "Monthly standing order" },
    { id: "ORD02", buyerId: "BUY02", date: "2024-05-10", status: "pending", items: [{ productId: "PRD01", qty: 24 }, { productId: "PRD04", qty: 20 }], notes: "Net-30 terms" },
    { id: "ORD03", buyerId: "BUY03", date: "2024-05-18", status: "fulfilled", items: [{ productId: "PRD02", qty: 6 }, { productId: "PRD03", qty: 12 }], notes: "Farmers market weekend" },
  ],
  tasks: [
    { id: "TSK01", title: "Spring inspection — all hives", due: "2024-06-01", category: "inspection", done: false, hiveId: "all" },
    { id: "TSK02", title: "Add honey supers — East Field", due: "2024-06-05", category: "management", done: false, hiveId: "H05" },
    { id: "TSK03", title: "Requeen River Bend", due: "2024-06-10", category: "management", done: false, hiveId: "H04" },
    { id: "TSK04", title: "Harvest extraction — North Apiary", due: "2024-06-20", category: "harvest", done: false, hiveId: "all" },
    { id: "TSK05", title: "Order new frames & foundation", due: "2024-05-25", category: "supplies", done: true, hiveId: null },
    { id: "TSK06", title: "Schedule Varroa treatment batch", due: "2024-08-01", category: "treatment", done: false, hiveId: "all" },
  ],
};

const TABS = ["Dashboard", "Hives", "Harvests", "Products", "Treatments", "Buyers & Orders", "Tasks"];

const pill = (label, color) => (
  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: color.bg, color: color.text, border: `0.5px solid ${color.border}`, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const strengthColor = (s) => s === "strong" ? GREEN : s === "medium" ? AMBER : CORAL;
const statusColor = (s) => s === "complete" || s === "fulfilled" ? TEAL : s === "pending" ? AMBER : BLUE;

const Card = ({ children, style = {} }) => (
  <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", ...style }}>
    {children}
  </div>
);

const MetricCard = ({ label, value, sub, color }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "0.85rem 1rem" }}>
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{sub}</div>}
  </div>
);

export default function ApiaryApp() {
  const [tab, setTab] = useState("Dashboard");
  const [modal, setModal] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [data, setDataRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("apiary-ops-data");
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const setData = (updater) => {
    setDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("apiary-ops-data", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const totalHoney = data.harvests.reduce((s, h) => s + h.rawLbs, 0);
  const totalRevenue = data.products.reduce((s, p) => s + p.unitsSold * p.pricePerUnit, 0);
  const totalCogs = data.products.reduce((s, p) => s + p.unitsSold * p.costPerUnit, 0);
  const pendingTasks = data.tasks.filter(t => !t.done).length;
  const pendingOrders = data.orders.filter(o => o.status === "pending").length;

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: "1rem" }}>
          <span style={{ fontSize: 22 }}>🐝</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Apiary Ops</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Hillside Honey Farm · {data.hives.length} hives</div>
          </div>
          {showResetConfirm ? (<span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}><span style={{ color: "var(--color-text-secondary)" }}>Reset data?</span><button onClick={() => { localStorage.removeItem("apiary-ops-data"); setDataRaw(initialData); setShowResetConfirm(false); }} style={{ fontSize: 11, padding: "3px 8px" }}>Yes</button><button onClick={() => setShowResetConfirm(false)} style={{ fontSize: 11, padding: "3px 8px", opacity: 0.5 }}>No</button></span>) : (<button onClick={() => setShowResetConfirm(true)} style={{ fontSize: 11, padding: "4px 10px", opacity: 0.5 }}>Reset demo</button>)}
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: "0.75rem", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0.5rem 0.85rem", fontSize: 13,
              color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t ? "2px solid var(--color-text-primary)" : "2px solid transparent",
              fontWeight: tab === t ? 500 : 400, whiteSpace: "nowrap"
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.25rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {tab === "Dashboard" && <Dashboard data={data} metrics={{ totalHoney, totalRevenue, totalCogs, pendingTasks, pendingOrders }} />}
        {tab === "Hives" && <Hives data={data} setData={setData} />}
        {tab === "Harvests" && <Harvests data={data} setData={setData} />}
        {tab === "Products" && <Products data={data} setData={setData} />}
        {tab === "Treatments" && <Treatments data={data} setData={setData} />}
        {tab === "Buyers & Orders" && <BuyersOrders data={data} setData={setData} />}
        {tab === "Tasks" && <Tasks data={data} setData={setData} />}
      </div>
    </div>
  );
}

function Dashboard({ data, metrics }) {
  const yieldByHive = data.hives.map(h => {
    const lbs = data.harvests.filter(ha => ha.hiveId === h.id).reduce((s, ha) => s + ha.rawLbs, 0);
    return { name: h.name, lbs };
  }).sort((a, b) => b.lbs - a.lbs);

  const productRevenue = data.products.map(p => ({
    name: p.name, revenue: p.unitsSold * p.pricePerUnit, margin: Math.round(((p.pricePerUnit - p.costPerUnit) / p.pricePerUnit) * 100)
  }));

  const upcomingTasks = data.tasks.filter(t => !t.done).slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <MetricCard label="Total honey harvested" value={`${metrics.totalHoney} lbs`} sub="all time" />
        <MetricCard label="Gross revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} sub="all products" color={TEAL.mid} />
        <MetricCard label="Gross margin" value={`${Math.round(((metrics.totalRevenue - metrics.totalCogs) / metrics.totalRevenue) * 100)}%`} sub="avg across products" />
        <MetricCard label="Pending orders" value={metrics.pendingOrders} sub="need fulfillment" color={metrics.pendingOrders > 0 ? CORAL.mid : undefined} />
        <MetricCard label="Open tasks" value={metrics.pendingTasks} sub="this season" color={metrics.pendingTasks > 2 ? AMBER.mid : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Honey yield by hive</div>
          {yieldByHive.map(h => (
            <div key={h.name} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{h.name}</span>
                <span style={{ fontWeight: 500 }}>{h.lbs} lbs</span>
              </div>
              <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${Math.round((h.lbs / 70) * 100)}%`, background: AMBER.mid, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Product performance</div>
          {productRevenue.map(p => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 12 }}>
              <span style={{ color: "var(--color-text-secondary)", flex: 1 }}>{p.name}</span>
              <span style={{ marginRight: 12, fontWeight: 500 }}>${p.revenue}</span>
              <span style={{ padding: "1px 6px", borderRadius: 10, background: p.margin > 60 ? TEAL.bg : AMBER.bg, color: p.margin > 60 ? TEAL.text : AMBER.text, fontSize: 11 }}>{p.margin}% margin</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.85rem" }}>Upcoming tasks</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {upcomingTasks.map(t => (
            <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 12 }}>
              <span style={{ fontSize: 16 }}>{t.category === "inspection" ? "🔍" : t.category === "harvest" ? "🍯" : t.category === "treatment" ? "💊" : t.category === "supplies" ? "📦" : "⚙️"}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{t.title}</div>
                <div style={{ color: "var(--color-text-secondary)" }}>Due {t.due}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Hives({ data, setData }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", queenYear: 2024, strength: "medium", notes: "" });

  const addHive = () => {
    const id = `H${String(data.hives.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, hives: [...d.hives, { id, lastInspected: new Date().toISOString().slice(0, 10), ...form }] }));
    setAdding(false);
    setForm({ name: "", location: "", queenYear: 2024, strength: "medium", notes: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Hive registry <span style={{ color: "var(--color-text-secondary)", fontWeight: 400, fontSize: 13 }}>({data.hives.length} hives)</span></div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 12, padding: "6px 12px" }}>+ Add hive</button>
      </div>

      {adding && (
        <Card style={{ background: "var(--color-background-secondary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Hive name</div><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Clover Queen" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Location</div><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. North Apiary" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Queen year</div><input type="number" value={form.queenYear} onChange={e => setForm(f => ({ ...f, queenYear: +e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Strength</div>
              <select value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="strong">Strong</option><option value="medium">Medium</option><option value="weak">Weak</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Notes</div><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observations, temperament, etc." style={{ width: "100%", boxSizing: "border-box" }} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addHive} style={{ fontSize: 12 }}>Save hive</button>
            <button onClick={() => setAdding(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button>
          </div>
        </Card>
      )}

      {data.hives.map(h => {
        const hiveHarvests = data.harvests.filter(ha => ha.hiveId === h.id);
        const totalLbs = hiveHarvests.reduce((s, ha) => s + ha.rawLbs, 0);
        const col = strengthColor(h.strength);
        return (
          <Card key={h.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{h.name}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{h.id}</span>
                  {pill(h.strength, col)}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                  📍 {h.location} &nbsp;·&nbsp; Queen {h.queenYear} &nbsp;·&nbsp; Last inspected {h.lastInspected}
                </div>
                {h.notes && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{h.notes}</div>}
              </div>
              <div style={{ textAlign: "right", minWidth: 80 }}>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{totalLbs}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>lbs harvested</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{hiveHarvests.length} harvests</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Harvests({ data, setData }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", hiveId: "", rawLbs: "", type: "", notes: "" });

  const addHarvest = () => {
    const id = `HAR${String(data.harvests.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, harvests: [...d.harvests, { id, ...form, rawLbs: +form.rawLbs }] }));
    setAdding(false);
    setForm({ date: "", hiveId: "", rawLbs: "", type: "", notes: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Harvest log</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 12, padding: "6px 12px" }}>+ Log harvest</button>
      </div>

      {adding && (
        <Card style={{ background: "var(--color-background-secondary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Date</div><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Hive</div>
              <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="">Select hive...</option>
                {data.hives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Raw lbs</div><input type="number" value={form.rawLbs} onChange={e => setForm(f => ({ ...f, rawLbs: e.target.value }))} placeholder="0" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Honey type / varietal</div><input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Clover, Wildflower" style={{ width: "100%", boxSizing: "border-box" }} /></div>
          </div>
          <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Notes</div><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={addHarvest} style={{ fontSize: 12 }}>Save</button><button onClick={() => setAdding(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button></div>
        </Card>
      )}

      {data.harvests.sort((a, b) => b.date.localeCompare(a.date)).map(h => {
        const hive = data.hives.find(hv => hv.id === h.hiveId);
        const products = data.products.filter(p => p.harvestId === h.id);
        return (
          <Card key={h.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{h.date} — {hive?.name || h.hiveId}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{h.type}</div>
                {h.notes && <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--color-text-secondary)" }}>{h.notes}</div>}
                {products.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>→ Products:</span>
                    {products.map(p => <span key={p.id} style={{ fontSize: 11, padding: "1px 7px", background: TEAL.bg, color: TEAL.text, borderRadius: 10 }}>{p.name}</span>)}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 500 }}>{h.rawLbs}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>lbs raw honey</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Products({ data, setData }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", type: "honey", harvestId: "", unitsProduced: "", unitsSold: 0, pricePerUnit: "", costPerUnit: "" });

  const typeIcon = { honey: "🍯", candle: "🕯️", cosmetic: "💄", supplement: "🌿" };

  const addProduct = () => {
    const id = `PRD${String(data.products.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, products: [...d.products, { id, ...form, unitsProduced: +form.unitsProduced, unitsSold: +form.unitsSold, pricePerUnit: +form.pricePerUnit, costPerUnit: +form.costPerUnit }] }));
    setAdding(false);
    setForm({ name: "", type: "honey", harvestId: "", unitsProduced: "", unitsSold: 0, pricePerUnit: "", costPerUnit: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Products</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 12, padding: "6px 12px" }}>+ Add product</button>
      </div>

      {adding && (
        <Card style={{ background: "var(--color-background-secondary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Product name</div><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Beeswax Candle 4oz" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Type</div>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="honey">Honey</option><option value="candle">Candle</option><option value="cosmetic">Cosmetic</option><option value="supplement">Supplement</option>
              </select>
            </div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Source harvest</div>
              <select value={form.harvestId} onChange={e => setForm(f => ({ ...f, harvestId: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="">Select harvest...</option>
                {data.harvests.map(h => <option key={h.id} value={h.id}>{h.date} — {data.hives.find(hv => hv.id === h.hiveId)?.name} ({h.rawLbs} lbs)</option>)}
              </select>
            </div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Units produced</div><input type="number" value={form.unitsProduced} onChange={e => setForm(f => ({ ...f, unitsProduced: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Price per unit ($)</div><input type="number" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Cost per unit ($)</div><input type="number" value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={addProduct} style={{ fontSize: 12 }}>Save</button><button onClick={() => setAdding(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button></div>
        </Card>
      )}

      {data.products.map(p => {
        const harvest = data.harvests.find(h => h.id === p.harvestId);
        const hive = data.hives.find(h => h.id === harvest?.hiveId);
        const revenue = p.unitsSold * p.pricePerUnit;
        const margin = Math.round(((p.pricePerUnit - p.costPerUnit) / p.pricePerUnit) * 100);
        const unsold = p.unitsProduced - p.unitsSold;
        return (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span>{typeIcon[p.type] || "📦"}</span>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  {pill(p.type, BLUE)}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                  Source: {harvest?.date} — {hive?.name || "Unknown"} · {harvest?.rawLbs} lbs
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12 }}>{p.unitsSold}/{p.unitsProduced} units sold</span>
                  <span style={{ fontSize: 12, color: unsold > 0 ? AMBER.text : "var(--color-text-secondary)" }}>{unsold} in stock</span>
                  <span style={{ fontSize: 12 }}>${p.pricePerUnit}/unit</span>
                  <span style={{ fontSize: 12, padding: "0 6px", background: margin > 60 ? TEAL.bg : AMBER.bg, color: margin > 60 ? TEAL.text : AMBER.text, borderRadius: 10 }}>{margin}% margin</span>
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 70 }}>
                <div style={{ fontSize: 18, fontWeight: 500 }}>${revenue}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>revenue</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Treatments({ data, setData }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ hiveId: "", date: "", type: "", reason: "", nextDue: "", status: "scheduled" });

  const addTreatment = () => {
    const id = `TRT${String(data.treatments.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, treatments: [...d.treatments, { id, ...form }] }));
    setAdding(false);
    setForm({ hiveId: "", date: "", type: "", reason: "", nextDue: "", status: "scheduled" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Treatment log</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 12, padding: "6px 12px" }}>+ Log treatment</button>
      </div>

      {adding && (
        <Card style={{ background: "var(--color-background-secondary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Hive</div>
              <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="">Select...</option>
                {data.hives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Treatment type</div><input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Oxalic Acid" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Date applied</div><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Next due date</div><input type="date" value={form.nextDue} onChange={e => setForm(f => ({ ...f, nextDue: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Reason</div><input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Status</div>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="scheduled">Scheduled</option><option value="complete">Complete</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={addTreatment} style={{ fontSize: 12 }}>Save</button><button onClick={() => setAdding(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button></div>
        </Card>
      )}

      {data.treatments.map(t => {
        const hive = data.hives.find(h => h.id === t.hiveId);
        const col = statusColor(t.status);
        return (
          <Card key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{t.type}</span>
                  {pill(t.status, col)}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {hive?.name} · {t.date} · {t.reason}
                </div>
                {t.nextDue && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Next due: {t.nextDue}</div>}
              </div>
              {t.status === "scheduled" && (
                <button onClick={() => setData(d => ({ ...d, treatments: d.treatments.map(tr => tr.id === t.id ? { ...tr, status: "complete" } : tr) }))} style={{ fontSize: 11, padding: "4px 10px" }}>Mark done</button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function BuyersOrders({ data, setData }) {
  const [view, setView] = useState("orders");
  const [addingOrder, setAddingOrder] = useState(false);
  const [form, setForm] = useState({ buyerId: "", date: new Date().toISOString().slice(0, 10), status: "pending", items: [{ productId: "", qty: 1 }], notes: "" });

  const orderTotal = (items) => items.reduce((s, item) => {
    const p = data.products.find(p => p.id === item.productId);
    return s + (p ? p.pricePerUnit * item.qty : 0);
  }, 0);

  const addOrder = () => {
    const id = `ORD${String(data.orders.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, orders: [...d.orders, { id, ...form }] }));
    setAddingOrder(false);
    setForm({ buyerId: "", date: new Date().toISOString().slice(0, 10), status: "pending", items: [{ productId: "", qty: 1 }], notes: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 4 }}>
        {["orders", "buyers"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 16px", fontSize: 13, color: view === v ? "var(--color-text-primary)" : "var(--color-text-secondary)", borderBottom: view === v ? "2px solid var(--color-text-primary)" : "2px solid transparent", fontWeight: view === v ? 500 : 400 }}>
            {v === "orders" ? "Orders" : "Buyers"}
          </button>
        ))}
        {view === "orders" && <button onClick={() => setAddingOrder(true)} style={{ fontSize: 12, padding: "4px 10px", marginLeft: "auto" }}>+ New order</button>}
      </div>

      {view === "buyers" && data.buyers.map(b => (
        <Card key={b.id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{b.contact} · {b.email}</div>
              {b.phone && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{b.phone}</div>}
            </div>
            {pill(b.type, BLUE)}
          </div>
        </Card>
      ))}

      {view === "orders" && (
        <>
          {addingOrder && (
            <Card style={{ background: "var(--color-background-secondary)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Buyer</div>
                  <select value={form.buyerId} onChange={e => setForm(f => ({ ...f, buyerId: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                    <option value="">Select...</option>
                    {data.buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Date</div><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>Line items</div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <select value={item.productId} onChange={e => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, productId: e.target.value } : it) }))} style={{ flex: 2 }}>
                      <option value="">Product...</option>
                      {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={item.qty} min={1} onChange={e => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, qty: +e.target.value } : it) }))} style={{ width: 60 }} />
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, items: [...f.items, { productId: "", qty: 1 }] }))} style={{ fontSize: 11, padding: "3px 8px", opacity: 0.7 }}>+ Add item</button>
              </div>
              <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Notes</div><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
              <div style={{ display: "flex", gap: 8 }}><button onClick={addOrder} style={{ fontSize: 12 }}>Save order</button><button onClick={() => setAddingOrder(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button></div>
            </Card>
          )}

          {data.orders.sort((a, b) => b.date.localeCompare(a.date)).map(o => {
            const buyer = data.buyers.find(b => b.id === o.buyerId);
            const total = orderTotal(o.items);
            const col = statusColor(o.status);
            return (
              <Card key={o.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{buyer?.name}</span>
                      {pill(o.status, col)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{o.date}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      {o.items.map((item, i) => {
                        const p = data.products.find(p => p.id === item.productId);
                        return <span key={i}>{item.qty}× {p?.name}{i < o.items.length - 1 ? ", " : ""}</span>;
                      })}
                    </div>
                    {o.notes && <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--color-text-secondary)", marginTop: 4 }}>{o.notes}</div>}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 70 }}>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>${total}</div>
                    {o.status === "pending" && (
                      <button onClick={() => setData(d => ({ ...d, orders: d.orders.map(ord => ord.id === o.id ? { ...ord, status: "fulfilled" } : ord) }))} style={{ fontSize: 11, padding: "3px 8px", marginTop: 4 }}>Fulfill</button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

function Tasks({ data, setData }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", due: "", category: "inspection", hiveId: "", done: false });
  const categoryColors = { inspection: BLUE, harvest: AMBER, treatment: CORAL, management: TEAL, supplies: GREEN };
  const categoryIcons = { inspection: "🔍", harvest: "🍯", treatment: "💊", management: "⚙️", supplies: "📦" };

  const addTask = () => {
    const id = `TSK${String(data.tasks.length + 1).padStart(2, "0")}`;
    setData(d => ({ ...d, tasks: [...d.tasks, { id, ...form }] }));
    setAdding(false);
    setForm({ title: "", due: "", category: "inspection", hiveId: "", done: false });
  };

  const toggleTask = (id) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));

  const pending = data.tasks.filter(t => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const done = data.tasks.filter(t => t.done);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Season checklist <span style={{ color: "var(--color-text-secondary)", fontWeight: 400, fontSize: 13 }}>({pending.length} open)</span></div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 12, padding: "6px 12px" }}>+ Add task</button>
      </div>

      {adding && (
        <Card style={{ background: "var(--color-background-secondary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Task</div><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Due date</div><input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Category</div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="inspection">Inspection</option><option value="harvest">Harvest</option><option value="treatment">Treatment</option><option value="management">Management</option><option value="supplies">Supplies</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={addTask} style={{ fontSize: 12 }}>Save</button><button onClick={() => setAdding(false)} style={{ fontSize: 12, opacity: 0.6 }}>Cancel</button></div>
        </Card>
      )}

      {pending.map(t => {
        const col = categoryColors[t.category] || BLUE;
        return (
          <Card key={t.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: 16, height: 16, cursor: "pointer" }} />
              <span style={{ fontSize: 18 }}>{categoryIcons[t.category]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Due {t.due}</div>
              </div>
              {pill(t.category, col)}
            </div>
          </Card>
        );
      })}

      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8, marginTop: 8 }}>Completed ({done.length})</div>
          {done.map(t => (
            <Card key={t.id} style={{ opacity: 0.5, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                <span style={{ textDecoration: "line-through", fontSize: 13 }}>{t.title}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
