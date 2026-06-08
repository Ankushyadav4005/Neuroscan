import { useState, useRef, useCallback, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#e05a5a", "#4caf7a"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Mono', monospace; background: #0a0a0a; color: #e8e4dc; min-height: 100vh; }
  .app { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;
    background: radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,200,100,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 70%, rgba(180,140,255,0.04) 0%, transparent 60%), #0a0a0a; }
  .header { text-align: center; margin-bottom: 48px; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 400; color: #e8e4dc; }
  .header h1 em { font-style: italic; color: #c9a84c; }
  .header p { margin-top: 12px; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #666; }
  .auth-box { width: 100%; max-width: 420px; border: 1px solid #2a2a2a; background: #111; padding: 40px; border-radius: 2px; }
  .auth-box h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 400; margin-bottom: 28px; color: #e8e4dc; }
  .input-group { margin-bottom: 18px; }
  .input-group label { display: block; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin-bottom: 8px; }
  .input-group input, .input-group select { width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #2a2a2a; color: #e8e4dc; font-family: 'DM Mono', monospace; font-size: 0.85rem; border-radius: 1px; outline: none; transition: border-color 0.2s; }
  .input-group input:focus, .input-group select:focus { border-color: #c9a84c; }
  .input-group select option { background: #0a0a0a; }
  .auth-btn { width: 100%; padding: 13px; background: transparent; border: 1px solid #c9a84c; color: #c9a84c; font-family: 'DM Mono', monospace; font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-top: 8px; border-radius: 1px; }
  .auth-btn:hover { background: rgba(201,168,76,0.1); }
  .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .switch-text { margin-top: 20px; font-size: 0.72rem; color: #555; text-align: center; }
  .switch-text span { color: #c9a84c; cursor: pointer; }
  .switch-text span:hover { text-decoration: underline; }
  .error-msg { margin-top: 14px; padding: 10px 14px; border: 1px solid #e05a5a; background: #110a0a; color: #e05a5a; font-size: 0.72rem; border-radius: 1px; }
  .success-msg { margin-top: 14px; padding: 10px 14px; border: 1px solid #4caf7a; background: #0a110d; color: #4caf7a; font-size: 0.72rem; border-radius: 1px; }
  .patient-form { width: 100%; max-width: 640px; border: 1px solid #2a2a2a; background: #111; padding: 32px; border-radius: 2px; margin-bottom: 24px; }
  .patient-form h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 400; color: #e8e4dc; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #1e1e1e; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .upload-area { width: 100%; max-width: 640px; border: 1px solid #2a2a2a; border-radius: 2px; background: #111; position: relative; overflow: hidden; transition: border-color 0.2s ease; cursor: pointer; }
  .upload-area:hover { border-color: #444; }
  .upload-area.dragging { border-color: #c9a84c; background: #141209; }
  .drop-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; min-height: 320px; gap: 20px; }
  .drop-zone .icon-wrap { width: 56px; height: 56px; border: 1px solid #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #555; }
  .upload-area.dragging .icon-wrap { border-color: #c9a84c; color: #c9a84c; }
  .drop-zone h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 400; color: #aaa; }
  .drop-zone p { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: #444; line-height: 1.8; }
  .drop-zone .btn { margin-top: 8px; padding: 10px 28px; background: transparent; border: 1px solid #333; color: #888; font-family: 'DM Mono', monospace; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 1px; }
  .drop-zone .btn:hover { border-color: #c9a84c; color: #c9a84c; }
  .preview-wrap { position: relative; width: 100%; }
  .preview-wrap img { width: 100%; display: block; max-height: 520px; object-fit: contain; background: #0d0d0d; }
  .preview-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0); transition: background 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0; }
  .preview-wrap:hover .preview-overlay { background: rgba(0,0,0,0.65); opacity: 1; }
  .overlay-btn { padding: 9px 22px; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.3); background: transparent; color: #e8e4dc; cursor: pointer; transition: all 0.15s; border-radius: 1px; }
  .overlay-btn:hover { background: rgba(255,255,255,0.1); }
  .overlay-btn.danger:hover { border-color: #e05a5a; color: #e05a5a; }
  .meta-bar { padding: 14px 20px; border-top: 1px solid #1e1e1e; display: flex; justify-content: space-between; align-items: center; background: #0d0d0d; }
  .meta-bar .file-name { font-size: 0.72rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
  .meta-bar .file-size { font-size: 0.72rem; color: #444; }
  .predict-btn { width: 100%; max-width: 640px; margin-top: 16px; padding: 14px; background: transparent; border: 1px solid #c9a84c; color: #c9a84c; font-family: 'DM Mono', monospace; font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 1px; }
  .predict-btn:hover:not(:disabled) { background: rgba(201,168,76,0.1); }
  .predict-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: #444; color: #444; }
  .result-box { width: 100%; max-width: 640px; margin-top: 16px; padding: 24px; border: 1px solid #2a2a2a; background: #111; border-radius: 2px; }
  .result-box.tumor { border-color: #e05a5a; }
  .result-box.no-tumor { border-color: #4caf7a; }
  .result-label { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 400; margin-bottom: 8px; }
  .result-box.tumor .result-label { color: #e05a5a; }
  .result-box.no-tumor .result-label { color: #4caf7a; }
  .result-prob { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: #666; }
  .result-patient { font-size: 0.72rem; color: #555; margin-top: 8px; }
  .progress-bar { margin-top: 12px; height: 3px; background: #1e1e1e; border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; transition: width 0.6s ease; }
  .result-box.tumor .progress-fill { background: #e05a5a; }
  .result-box.no-tumor .progress-fill { background: #4caf7a; }
  .navbar { width: 100%; max-width: 640px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding: 12px 0; border-bottom: 1px solid #1e1e1e; }
  .navbar .welcome { font-size: 0.72rem; color: #666; letter-spacing: 0.1em; }
  .navbar .welcome span { color: #c9a84c; }
  .nav-btn { padding: 7px 18px; background: transparent; border: 1px solid #333; color: #666; font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 1px; }
  .nav-btn:hover { border-color: #c9a84c; color: #c9a84c; }
  .nav-btn.active { border-color: #c9a84c; color: #c9a84c; }
  .logout-btn { padding: 7px 18px; background: transparent; border: 1px solid #333; color: #666; font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 1px; }
  .logout-btn:hover { border-color: #e05a5a; color: #e05a5a; }
  .hint { margin-top: 24px; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #333; text-align: center; margin-bottom: 40px; }
  .history-box { width: 100%; max-width: 640px; margin-top: 32px; }
  .history-box h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 400; color: #e8e4dc; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #1e1e1e; }
  .history-item { padding: 14px 20px; border: 1px solid #1e1e1e; background: #111; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-radius: 1px; }
  .history-item.tumor { border-left: 3px solid #e05a5a; }
  .history-item.no-tumor { border-left: 3px solid #4caf7a; }
  .history-filename { font-size: 0.72rem; color: #888; margin-bottom: 2px; }
  .history-patient { font-size: 0.7rem; color: #c9a84c; margin-bottom: 2px; }
  .history-date { font-size: 0.65rem; color: #444; }
  .history-result { font-size: 0.72rem; text-align: right; }
  .history-result.tumor { color: #e05a5a; }
  .history-result.no-tumor { color: #4caf7a; }
  .no-history { font-size: 0.72rem; color: #444; text-align: center; padding: 24px; border: 1px dashed #1e1e1e; border-radius: 2px; }
  .dashboard { width: 100%; max-width: 640px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat-card { padding: 20px; border: 1px solid #2a2a2a; background: #111; border-radius: 2px; text-align: center; }
  .stat-number { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 400; color: #c9a84c; }
  .stat-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin-top: 6px; }
  .chart-box { border: 1px solid #2a2a2a; background: #111; padding: 24px; border-radius: 2px; margin-bottom: 16px; }
  .chart-box h4 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; color: #e8e4dc; margin-bottom: 20px; }
  .no-data { font-size: 0.72rem; color: #444; text-align: center; padding: 40px; }
  .legend { display: flex; gap: 20px; margin-top: 12px; justify-content: center; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.68rem; color: #666; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
`;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// ── AUTH FORM ──
function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const url = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/signup";
    const body = isLogin
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); }
      else if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);
        onLogin(data.name, data.token);
      } else {
        setSuccess("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Brain <em>Tumor</em> Detection</h1>
        <p>{isLogin ? "Sign in to continue" : "Create your account"}</p>
      </div>
      <div className="auth-box">
        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
        {!isLogin && (
          <div className="input-group">
            <label>Name</label>
            <input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>
        {error && <div className="error-msg">⚠ {error}</div>}
        {success && <div className="success-msg">✓ {success}</div>}
        <div className="switch-text">
          {isLogin
            ? <>Don't have an account? <span onClick={() => { setIsLogin(false); setError(null); }}>Sign Up</span></>
            : <>Already have an account? <span onClick={() => { setIsLogin(true); setError(null); }}>Login</span></>}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [token]);

  if (!stats) return <div style={{ color: "#444", fontSize: "0.72rem", textAlign: "center", padding: "40px" }}>Loading stats...</div>;

  const pieData = [
    { name: "Tumor", value: stats.tumor_count },
    { name: "No Tumor", value: stats.no_tumor_count }
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#e05a5a" }}>{stats.tumor_count}</div>
          <div className="stat-label">Tumor Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#4caf7a" }}>{stats.no_tumor_count}</div>
          <div className="stat-label">No Tumor</div>
        </div>
      </div>

      <div className="chart-box">
        <h4>Tumor vs No Tumor</h4>
        {stats.total === 0 ? (
          <div className="no-data">No scans yet — upload an MRI to see stats</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 2, fontSize: "0.72rem" }} itemStyle={{ color: "#e8e4dc" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: "#e05a5a" }} />Tumor ({stats.tumor_count})</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#4caf7a" }} />No Tumor ({stats.no_tumor_count})</div>
            </div>
          </>
        )}
      </div>

      <div className="chart-box">
        <h4>Scans Over Time</h4>
        {stats.daily_data.length === 0 ? (
          <div className="no-data">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.daily_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 2, fontSize: "0.72rem" }} itemStyle={{ color: "#e8e4dc" }} />
              <Line type="monotone" dataKey="scans" stroke="#c9a84c" strokeWidth={2} dot={{ fill: "#c9a84c", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── UPLOADER ──
function Uploader({ user, token, onLogout }) {
  const [page, setPage] = useState("upload");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [patient, setPatient] = useState({ name: "", age: "", gender: "" });
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHistory(data.reverse()))
      .catch(() => {});
  }, [token]);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImage({ url, name: file.name, size: file.size });
    setImageFile(file);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => handleFile(e.target.files[0]);
  const openFile = () => inputRef.current?.click();

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePredict = async () => {
    if (!imageFile) return;
    if (!patient.name || !patient.age || !patient.gender) {
      setError("Please fill in all patient details before analyzing.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("patient_name", patient.name);
      formData.append("patient_age", patient.age);
      formData.append("patient_gender", patient.gender);

      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
      setHistory(prev => [{
        filename: imageFile.name,
        patient_name: patient.name,
        patient_age: patient.age,
        patient_gender: patient.gender,
        tumor_detected: data.tumor_detected,
        confidence: data.confidence,
        date: new Date().toLocaleString()
      }, ...prev]);
    } catch {
      setError("Could not connect to backend. Make sure Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Navbar */}
      <div className="navbar">
        <div className="welcome">Welcome, <span>{user}</span></div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className={`nav-btn ${page === "upload" ? "active" : ""}`} onClick={() => setPage("upload")}>Upload</button>
          <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Dashboard</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Dashboard Page */}
      {page === "dashboard" && (
        <>
          <div className="header">
            <h1>Analytics <em>Dashboard</em></h1>
            <p>Your scan statistics and insights</p>
          </div>
          <Dashboard token={token} />
          <p className="hint">Data updates after each scan</p>
        </>
      )}

      {/* Upload Page */}
      {page === "upload" && (
        <>
          <div className="header">
            <h1>Brain <em>Tumor</em> Detection</h1>
            <p>Fill patient details and upload MRI scan</p>
          </div>

          {/* Patient Form */}
          <div className="patient-form">
            <h3>Patient Information</h3>
            <div className="input-group">
              <label>Patient Name</label>
              <input placeholder="Full name" value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Age</label>
                <input type="number" placeholder="Age" value={patient.age} onChange={e => setPatient({ ...patient, age: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select value={patient.gender} onChange={e => setPatient({ ...patient, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`upload-area ${dragging ? "dragging" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={!image ? openFile : undefined}
          >
            {!image ? (
              <div className="drop-zone">
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h2>{dragging ? "Release to upload" : "Drag & drop MRI scan"}</h2>
                <p>PNG, JPG, WEBP supported</p>
                <button className="btn" onClick={(e) => { e.stopPropagation(); openFile(); }}>Browse files</button>
              </div>
            ) : (
              <>
                <div className="preview-wrap">
                  <img src={image.url} alt={image.name} />
                  <div className="preview-overlay">
                    <button className="overlay-btn" onClick={openFile}>Replace</button>
                    <button className="overlay-btn danger" onClick={clearImage}>Remove</button>
                  </div>
                </div>
                <div className="meta-bar">
                  <span className="file-name">{image.name}</span>
                  <span className="file-size">{formatBytes(image.size)}</span>
                </div>
              </>
            )}
          </div>

          <button className="predict-btn" onClick={handlePredict} disabled={!image || loading}>
            {loading ? "Analyzing..." : "Analyze MRI Scan"}
          </button>

          {error && (
            <div style={{ width: "100%", maxWidth: 640, marginTop: 16, padding: "14px 20px", border: "1px solid #e05a5a", background: "#110a0a", borderRadius: 2, fontSize: "0.72rem", color: "#e05a5a" }}>
              ⚠ {error}
            </div>
          )}

          {result && (
            <div className={`result-box ${result.tumor_detected ? "tumor" : "no-tumor"}`}>
              <div className="result-label">
                {result.tumor_detected ? "⚠ Tumor Detected" : "✓ No Tumor Detected"}
              </div>
              <div className="result-prob">Confidence: {result.confidence}%</div>
              <div className="result-patient">
                Patient: {result.patient_name} · Age: {result.patient_age} · {result.patient_gender}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
          )}

          {/* History */}
          <div className="history-box">
            <h3>Past Scans</h3>
            {history.length === 0 ? (
              <div className="no-history">No scans yet — upload an MRI to get started</div>
            ) : (
              history.map((scan, i) => (
                <div key={i} className={`history-item ${scan.tumor_detected ? "tumor" : "no-tumor"}`}>
                  <div>
                    <div className="history-patient">{scan.patient_name} · {scan.patient_age} · {scan.patient_gender}</div>
                    <div className="history-filename">{scan.filename}</div>
                    <div className="history-date">{scan.date}</div>
                  </div>
                  <div className={`history-result ${scan.tumor_detected ? "tumor" : "no-tumor"}`}>
                    {scan.tumor_detected ? "⚠ Tumor" : "✓ No Tumor"}<br />{scan.confidence}%
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="hint">Powered by VGG16 · Secured with JWT</p>
        </>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onInputChange} />
    </div>
  );
}

// ── ROOT ──
export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("name"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogin = (name, token) => {
    setUser(name);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setUser(null);
    setToken(null);
  };

  if (!user || !token) {
    return (
      <>
        <style>{styles}</style>
        <AuthForm onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <Uploader user={user} token={token} onLogout={handleLogout} />
    </>
  );
}