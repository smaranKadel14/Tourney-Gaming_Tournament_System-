import { useState, useEffect } from "react";
import { ArrowLeft, Edit3, Users, AlertTriangle, Save, Trash2, Loader2, CheckCircle, XCircle, Clock, GitBranch } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./TournamentManager.css";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";

interface TournamentRow {
  id: string;
  name: string;
  game: string;
  date: string;
  status: string;
  participants: number;
  endDate?: string;
  location?: string;
  registrationDeadline?: string;
  prizePool?: string;
  description?: string;
  maxParticipants?: number;
  registrationFee?: number;
  teamSize?: number;
  imageUrl?: string;
  bracketData?: any[];
}

interface Registration {
  _id: string;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  team?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
}

interface Props {
  tournament: TournamentRow;
  onBack: () => void;
  onDeleted: (id: string) => void;
  onUpdate?: (updated: TournamentRow) => void;
}

type Tab = "details" | "participants" | "bracket" | "danger";

const CustomSeed = ({ seed, roundIndex, seedIndex, bracketData, onUpdate }: any) => {
  const [editing, setEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(seed.teams[0]?.score ?? "");
  const [team2Score, setTeam2Score] = useState(seed.teams[1]?.score ?? "");
  const [team1Status, setTeam1Status] = useState<"W" | "L" | null>(seed.teams[0]?.status || null);
  const [team2Status, setTeam2Status] = useState<"W" | "L" | null>(seed.teams[1]?.status || null);

  const handleDragStart = (e: React.DragEvent, teamIndex: 0 | 1) => {
    if (roundIndex !== 0) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ seedIndex, teamIndex }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (roundIndex !== 0) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTeamIndex: 0 | 1) => {
    if (roundIndex !== 0) return;
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const draggedData = JSON.parse(dataStr);
      const sourceSeedIndex = draggedData.seedIndex;
      const sourceTeamIndex = draggedData.teamIndex;

      if (sourceSeedIndex === seedIndex && sourceTeamIndex === targetTeamIndex) return;

      const newData = JSON.parse(JSON.stringify(bracketData));
      
      const sourceTeam = newData[0].seeds[sourceSeedIndex].teams[sourceTeamIndex];
      const targetTeam = newData[0].seeds[seedIndex].teams[targetTeamIndex];

      newData[0].seeds[sourceSeedIndex].teams[sourceTeamIndex] = targetTeam;
      newData[0].seeds[seedIndex].teams[targetTeamIndex] = sourceTeam;

      onUpdate(newData);
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleSetWinner = (winnerIndex: 0 | 1) => {
      setTeam1Status(winnerIndex === 0 ? "W" : "L");
      setTeam2Status(winnerIndex === 1 ? "W" : "L");
  };

  const handleSave = () => {
    const newData = [...bracketData];
    newData[roundIndex].seeds[seedIndex].teams[0].score = team1Score;
    newData[roundIndex].seeds[seedIndex].teams[1].score = team2Score;
    
    // Auto-infer winner if not explicitly set but scores exist
    let t1w = team1Status === "W";
    let t2w = team2Status === "W";
    
    if (!t1w && !t2w && team1Score !== "" && team2Score !== "") {
        const n1 = Number(team1Score);
        const n2 = Number(team2Score);
        if (!isNaN(n1) && !isNaN(n2)) {
            if (n1 > n2) { t1w = true; }
            else if (n2 > n1) { t2w = true; }
        }
    }

    if (t1w) {
        newData[roundIndex].seeds[seedIndex].teams[0].status = "W";
        newData[roundIndex].seeds[seedIndex].teams[1].status = "L";
    } else if (t2w) {
        newData[roundIndex].seeds[seedIndex].teams[0].status = "L";
        newData[roundIndex].seeds[seedIndex].teams[1].status = "W";
    }

    // Advance to next round if there is one
    if (roundIndex + 1 < newData.length && (t1w || t2w)) {
       const nextRoundSeeds = newData[roundIndex + 1].seeds;
       const nextMatchIndex = Math.floor(seedIndex / 2);
       const teamPositionIndex = seedIndex % 2; // 0 for team 1, 1 for team 2
       
       const winnerName = t1w ? seed.teams[0]?.name : seed.teams[1]?.name;
       nextRoundSeeds[nextMatchIndex].teams[teamPositionIndex].name = winnerName;
       nextRoundSeeds[nextMatchIndex].teams[teamPositionIndex].score = "";
       nextRoundSeeds[nextMatchIndex].teams[teamPositionIndex].status = null;
    }
    
    onUpdate(newData);
    setEditing(false);
  };

  const t1Winner = team1Status === "W" || seed.teams[0]?.status === "W";
  const t2Winner = team2Status === "W" || seed.teams[1]?.status === "W";

  return (
    <Seed mobileBreakpoint={768} style={{ fontSize: 12 }}>
      <SeedItem>
        <div>
          <SeedTeam 
             style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', background: t1Winner ? 'rgba(74, 222, 128, 0.2)' : 'transparent', cursor: roundIndex === 0 ? 'grab' : 'default' }}
             draggable={roundIndex === 0}
             onDragStart={(e: React.DragEvent) => handleDragStart(e, 0)}
             onDragOver={handleDragOver}
             onDrop={(e: React.DragEvent) => handleDrop(e, 0)}
          >
             <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
                 {editing && <button style={{padding: '2px 4px', fontSize: 9, background: team1Status === 'W' ? '#4ade80' : '#444', color: 'white'}} onClick={() => handleSetWinner(0)}>W</button>}
                 <span style={{color: t1Winner ? '#4ade80' : 'inherit', fontWeight: t1Winner ? 'bold' : 'normal'}}>{seed.teams[0]?.name || "TBD"}</span>
             </div>
             {editing ? 
                <input type="text" style={{width: 40, background: '#333', color: 'white', border: 'none', borderRadius: 2, paddingLeft: 4}} value={team1Score} onChange={e => setTeam1Score(e.target.value)} placeholder="Score" /> : 
                <span style={{display: 'flex', gap: '5px'}}>
                   <span>{seed.teams[0]?.score}</span>
                   {seed.teams[0]?.status && <strong style={{color: t1Winner ? '#4ade80' : '#ef4444'}}>{seed.teams[0]?.status}</strong>}
                </span>
             }
          </SeedTeam>
          <div style={{ height: 1, backgroundColor: '#333' }}></div>
          <SeedTeam 
             style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', background: t2Winner ? 'rgba(74, 222, 128, 0.2)' : 'transparent', cursor: roundIndex === 0 ? 'grab' : 'default' }}
             draggable={roundIndex === 0}
             onDragStart={(e: React.DragEvent) => handleDragStart(e, 1)}
             onDragOver={handleDragOver}
             onDrop={(e: React.DragEvent) => handleDrop(e, 1)}
          >
             <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
                 {editing && <button style={{padding: '2px 4px', fontSize: 9, background: team2Status === 'W' ? '#4ade80' : '#444', color: 'white'}} onClick={() => handleSetWinner(1)}>W</button>}
                 <span style={{color: t2Winner ? '#4ade80' : 'inherit', fontWeight: t2Winner ? 'bold' : 'normal'}}>{seed.teams[1]?.name || "TBD"}</span>
             </div>
             {editing ? 
                <input type="text" style={{width: 40, background: '#333', color: 'white', border: 'none', borderRadius: 2, paddingLeft: 4}} value={team2Score} onChange={e => setTeam2Score(e.target.value)} placeholder="Score" /> : 
                <span style={{display: 'flex', gap: '5px'}}>
                   <span>{seed.teams[1]?.score}</span>
                   {seed.teams[1]?.status && <strong style={{color: t2Winner ? '#4ade80' : '#ef4444'}}>{seed.teams[1]?.status}</strong>}
                </span>
             }
          </SeedTeam>
        </div>
      </SeedItem>
      {seed.teams[0]?.name !== "TBD" && seed.teams[1]?.name !== "TBD" && (
          <button 
             style={{ marginTop: 5, padding: '4px 8px', fontSize: 10, cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, width: '100%' }}
             onClick={() => editing ? handleSave() : setEditing(true)}
          >
             {editing ? "Save Match" : "Edit Match"}
          </button>
      )}
    </Seed>
  );
};

const TournamentManager = ({ tournament, onBack, onDeleted, onUpdate }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  const [bracketData, setBracketData] = useState<any[] | null>(tournament.bracketData || null);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [bracketError, setBracketError] = useState("");

  // --- Details tab state ---
  const [form, setForm] = useState({
    title: tournament.name,
    description: tournament.description || "",
    location: tournament.location || "",
    prizePool: tournament.prizePool || "",
    maxParticipants: tournament.maxParticipants ?? 0,
    registrationFee: tournament.registrationFee ?? 0,
    teamSize: (tournament.teamSize && tournament.teamSize >= 2) ? tournament.teamSize : 5,
    status: tournament.status === "Live" ? "ongoing"
          : tournament.status === "Completed" ? "completed"
          : "upcoming",
    imageUrl: tournament.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Participants tab state ---
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // --- Danger zone state ---
  const [deleting, setDeleting] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (activeTab === "participants") {
      fetchRegistrations();
    }
  }, [activeTab]);

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRegistrations(await res.json());
    } catch (e) {
      console.error("Error fetching registrations", e);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleGenerateBracket = async () => {
    setGeneratingBracket(true);
    setBracketError("");
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}/bracket/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBracketData(data.bracketData);
      } else {
        setBracketError(data.message || "Failed to generate bracket");
      }
    } catch {
      setBracketError("Server error.");
    } finally {
      setGeneratingBracket(false);
    }
  };

  const handleUpdateBracket = async (newBracketData: any[]) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}/bracket`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bracketData: newBracketData }),
      });
      if (res.ok) {
        setBracketData(newBracketData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaveMsg({ type: "success", text: "Changes saved successfully." });
        
        // Notify parent with updated data
        if (onUpdate) {
            onUpdate({
                ...tournament,
                name: form.title,
                description: form.description,
                location: form.location,
                prizePool: form.prizePool,
                maxParticipants: form.maxParticipants,
                registrationFee: form.registrationFee,
                teamSize: form.teamSize,
                imageUrl: form.imageUrl,
                status: (form.status === "ongoing" ? "Live" : form.status === "completed" ? "Completed" : "Registrations Open") as any
            });
        }
      } else {
        const d = await res.json();
        setSaveMsg({ type: "error", text: d.message || "Failed to save." });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Server error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${tournament.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDeleted(tournament.id);
        onBack();
      } else {
        const d = await res.json();
        alert(d.message || "Failed to delete.");
      }
    } catch {
      alert("Server error. Could not delete.");
    } finally {
      setDeleting(false);
    }
  };

  const regStatusIcon = (s: string) => {
    if (s === "confirmed") return <CheckCircle size={14} className="tm-reg-icon tm-reg-icon--confirmed" />;
    if (s === "cancelled" || s === "rejected") return <XCircle size={14} className="tm-reg-icon tm-reg-icon--cancelled" />;
    return <Clock size={14} className="tm-reg-icon tm-reg-icon--pending" />;
  };

  return (
    <div className="tm-container animate-fade-in">
      {/* Header */}
      <div className="tm-header">
        <div className="tm-header-left">
          <button className="tm-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back to My Tournaments
          </button>
          <h2 className="tm-title">{tournament.name}</h2>
          <p className="tm-subtitle">{tournament.game} · {tournament.date}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tm-tabs">
        <button
          className={`tm-tab ${activeTab === "details" ? "tm-tab--active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <Edit3 size={15} /> Details
        </button>
        <button
          className={`tm-tab ${activeTab === "participants" ? "tm-tab--active" : ""}`}
          onClick={() => setActiveTab("participants")}
        >
          <Users size={15} /> Participants <span className="tm-tab-count">{registrations.length || tournament.participants}</span>
        </button>
        <button
          className={`tm-tab ${activeTab === "bracket" ? "tm-tab--active" : ""}`}
          onClick={() => setActiveTab("bracket")}
        >
          <GitBranch size={15} /> Bracket
        </button>
        <button
          className={`tm-tab tm-tab--danger ${activeTab === "danger" ? "tm-tab--active tm-tab--danger-active" : ""}`}
          onClick={() => setActiveTab("danger")}
        >
          <AlertTriangle size={15} /> Danger Zone
        </button>
      </div>

      {/* --- Details Tab --- */}
      {activeTab === "details" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">Edit tournament details. Click Save to apply changes.</div>

          {saveMsg && (
            <div className={`tm-alert tm-alert--${saveMsg.type}`}>{saveMsg.text}</div>
          )}

          <div className="tm-form-grid">
            <div className="tm-form-group">
              <label>Tournament Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="tm-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="upcoming">Upcoming (Registrations Open)</option>
                <option value="ongoing">Ongoing (Live)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="tm-form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>

            <div className="tm-form-group">
              <label>Prize Pool</label>
              <input value={form.prizePool} onChange={e => setForm(p => ({ ...p, prizePool: e.target.value }))} placeholder="e.g. $500, TBA" />
            </div>

            <div className="tm-form-group">
              <label>Max Participants <span className="tm-hint">(0 = unlimited)</span></label>
              <input type="number" min={0} value={form.maxParticipants} onChange={e => setForm(p => ({ ...p, maxParticipants: Number(e.target.value) }))} />
            </div>

            <div className="tm-form-group">
              <label>Registration Fee <span className="tm-hint">(Rs.)</span></label>
              <input type="number" min={0} value={form.registrationFee} onChange={e => setForm(p => ({ ...p, registrationFee: Number(e.target.value) }))} />
            </div>

            <div className="tm-form-group">
              <label>Team Size <span className="tm-hint">(Members per team)</span></label>
              <input type="number" min={2} value={form.teamSize} onChange={e => setForm(p => ({ ...p, teamSize: Number(e.target.value) }))} />
            </div>

            <div className="tm-form-group tm-full-width">
              <label>Banner Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="tm-form-group tm-full-width">
              <label>Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="tm-form-actions">
            <button className="tm-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="tm-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* --- Participants Tab --- */}
      {activeTab === "participants" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">All players registered for this tournament.</div>

          {loadingRegs ? (
            <div className="tm-empty">
              <div className="mt-loader" />
              <p>Loading participants...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="tm-empty">
              <Users size={40} opacity={0.3} />
              <p>No registrations yet.</p>
            </div>
          ) : (
            <div className="tm-reg-table-wrap">
              <table className="tm-reg-table">
                <thead>
                  <tr>
                    <th>PLAYER / TEAM</th>
                    <th>EMAIL</th>
                    <th>REGISTERED</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="tm-player-cell">
                          <div className="tm-player-avatar">
                            {r.team?.logoUrl 
                              ? <img src={`http://localhost:5000${r.team.logoUrl}`} alt="" />
                              : r.user?.avatarUrl
                                ? <img src={`http://localhost:5000${r.user.avatarUrl}`} alt="" />
                                : <span>{(r.team?.name || r.user?.fullName || "?").charAt(0)}</span>
                            }
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                             <span className="tm-player-name">{r.user?.fullName ?? "Unknown"}</span>
                             {r.team && <span style={{ fontSize: '10px', color: '#a200ff', fontWeight: 600 }}>Team: {r.team.name}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="tm-muted">{r.user?.email}</td>
                      <td className="tm-muted">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`tm-badge tm-badge--${r.status}`}>
                          {regStatusIcon(r.status)} {r.status}
                        </span>
                      </td>
                      <td>
                        <span className={`tm-badge tm-badge--${r.paymentStatus}`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Bracket Tab --- */}
      {activeTab === "bracket" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">Manage the tournament bracket.</div>
          
          {bracketError && <div className="tm-alert tm-alert--error">{bracketError}</div>}
          
          {!bracketData || bracketData.length === 0 ? (
            <div className="tm-empty" style={{marginTop: "2rem"}}>
               <p style={{marginBottom: "1rem"}}>No bracket has been generated yet.</p>
               <button className="tm-save-btn" onClick={handleGenerateBracket} disabled={generatingBracket}>
                  {generatingBracket ? "Generating..." : "Generate Bracket"}
               </button>
            </div>
          ) : (
            <div className="tm-bracket-wrap" style={{ overflowX: 'auto', padding: '2rem 0', display: 'flex', flexDirection: 'column' }}>
               <Bracket 
                  rounds={bracketData} 
                  renderSeedComponent={(props: any) => (
                      <CustomSeed 
                          seed={props.seed} 
                          roundIndex={props.roundIndex}
                          seedIndex={props.seedIndex}
                          bracketData={bracketData}
                          onUpdate={handleUpdateBracket}
                      />
                  )} 
               />
               <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2rem' }}>
                   <button 
                       className="tm-save-btn" 
                       style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: '12px', padding: '6px 12px', width: 'auto', opacity: 0.8 }}
                       onClick={() => {
                           if (window.confirm("Are you sure you want to regenerate the bracket? This will wipe all current match data.")) {
                               handleGenerateBracket();
                           }
                       }}
                       disabled={generatingBracket}
                   >
                       {generatingBracket ? "Regenerating..." : "Reset Bracket"}
                   </button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- Danger Zone Tab --- */}
      {activeTab === "danger" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-danger-card">
            <div className="tm-danger-icon"><AlertTriangle size={24} /></div>
            <div className="tm-danger-body">
              <div className="tm-danger-title">Delete Tournament</div>
              <div className="tm-danger-desc">
                This will permanently delete <strong>"{tournament.name}"</strong> and all its registrations. This action cannot be undone.
              </div>
            </div>
            <button className="tm-delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="tm-spin" /> : <Trash2 size={16} />}
              {deleting ? "Deleting..." : "Delete Tournament"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManager;
