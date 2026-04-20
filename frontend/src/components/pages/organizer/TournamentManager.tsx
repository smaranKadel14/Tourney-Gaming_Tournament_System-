import { useState, useEffect } from "react";
import { ArrowLeft, Edit3, Users, AlertTriangle, Save, Trash2, Loader2, CheckCircle, XCircle, Clock, GitBranch, Zap, Layout, Upload, Image as ImageIcon, X } from "lucide-react";
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
    const team = seed.teams[teamIndex];
    if (!team || team.name === "TBD" || team.name === "BYE") return;

    e.dataTransfer.setData("application/json", JSON.stringify({ 
      type: "bracket",
      seedIndex, 
      teamIndex,
      team
    }));
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
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const draggedData = JSON.parse(dataStr);

      if (draggedData.type === "bracket") {
        const sourceSeedIndex = draggedData.seedIndex;
        const sourceTeamIndex = draggedData.teamIndex;

        if (sourceSeedIndex === seedIndex && sourceTeamIndex === targetTeamIndex) return;

        const newData = JSON.parse(JSON.stringify(bracketData));
        
        const sourceTeam = newData[0].seeds[sourceSeedIndex].teams[sourceTeamIndex];
        const targetTeam = newData[0].seeds[seedIndex].teams[targetTeamIndex];

        newData[0].seeds[sourceSeedIndex].teams[sourceTeamIndex] = targetTeam;
        newData[0].seeds[seedIndex].teams[targetTeamIndex] = sourceTeam;

        onUpdate(newData);
      } else if (draggedData.type === "list") {
        const team = draggedData.team;
        const newData = JSON.parse(JSON.stringify(bracketData));
        
        // If there's already a team here, swap them? 
        // Or just place and remove from list. 
        // The TournamentManager will handle the list update via onUpdate.
        
        const existingTeam = newData[0].seeds[seedIndex].teams[targetTeamIndex];
        newData[0].seeds[seedIndex].teams[targetTeamIndex] = {
           ...team,
           score: "",
           status: null
        };

        onUpdate(newData, existingTeam?.name !== "TBD" ? existingTeam : null, team);
      }
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
  const [unassignedTeams, setUnassignedTeams] = useState<any[]>([]);

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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState(tournament.imageUrl ? 
    (tournament.imageUrl.startsWith("http") ? tournament.imageUrl : `http://localhost:5000${tournament.imageUrl}`) : "");
  
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Participants tab state ---
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // --- Danger zone state ---
  const [deleting, setDeleting] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (activeTab === "participants" || activeTab === "bracket") {
      fetchRegistrations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "bracket" && registrations.length > 0) {
      if (bracketData && bracketData.length > 0) {
        // Find teams that are NOT in the bracket yet
        const assignedNames = new Set<string>();
        bracketData.forEach(round => {
          round.seeds.forEach((seed: any) => {
            seed.teams.forEach((t: any) => {
              if (t && t.name && t.name !== "TBD" && t.name !== "BYE") {
                assignedNames.add(t.name);
              }
            });
          });
        });

        const unassigned = registrations
          .filter(r => r.status === "confirmed")
          .map(r => ({
            id: r.team?._id || r.user?._id,
            name: r.team?.name || r.user?.fullName
          }))
          .filter(t => !assignedNames.has(t.name));
        
        setUnassignedTeams(unassigned);
      } else {
        // If no bracket, all confirmed participants are unassigned
        const unassigned = registrations
          .filter(r => r.status === "confirmed")
          .map(r => ({
            id: r.team?._id || r.user?._id,
            name: r.team?.name || r.user?.fullName
          }));
        setUnassignedTeams(unassigned);
      }
    }
  }, [activeTab, registrations, bracketData]);

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

  const handleInitializeManualBracket = () => {
    const confirmedCount = registrations.filter(r => r.status === "confirmed").length;
    if (confirmedCount < 2) {
      setBracketError("At least 2 confirmed participants are required.");
      return;
    }

    // Calculate nearest power of 2
    const powerOf2 = Math.pow(2, Math.ceil(Math.log2(confirmedCount)));
    const totalMatches = powerOf2 / 2;

    const roundOneSeeds: any[] = [];
    for (let i = 0; i < totalMatches; i++) {
      roundOneSeeds.push({
        id: i + 1,
        date: new Date().toDateString(),
        teams: [
          { name: "TBD", score: "", status: null },
          { name: "TBD", score: "", status: null }
        ]
      });
    }

    const initialBracket = [{ title: 'Round 1', seeds: roundOneSeeds }];

    // Add subsequent empty rounds
    let currentRoundMatches = totalMatches;
    let roundNum = 2;
    while (currentRoundMatches > 1) {
      currentRoundMatches /= 2;
      const roundSeeds: any[] = [];
      for (let i = 0; i < currentRoundMatches; i++) {
        roundSeeds.push({
          id: i + 100 * roundNum,
          date: new Date().toDateString(),
          teams: [
            { name: "TBD", score: "", status: null },
            { name: "TBD", score: "", status: null }
          ]
        });
      }
      initialBracket.push({ title: `Round ${roundNum}`, seeds: roundSeeds });
      roundNum++;
    }

    setBracketData(initialBracket);
    handleUpdateBracket(initialBracket);
  };

  const handleUpdateBracket = async (newBracketData: any[], teamToRemove?: any, teamToAdd?: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}/bracket`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bracketData: newBracketData }),
      });
      if (res.ok) {
        setBracketData(newBracketData);
        // Sync unassigned teams locally too for immediate feedback
        if (teamToRemove || teamToAdd) {
            let nextUnassigned = [...unassignedTeams];
            if (teamToRemove) nextUnassigned.push(teamToRemove);
            if (teamToAdd) nextUnassigned = nextUnassigned.filter(t => t.name !== teamToAdd.name);
            setUnassignedTeams(nextUnassigned);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      if (bannerFile) {
        data.append("banner", bannerFile);
      }

      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (res.ok) {
        setSaveMsg({ type: "success", text: "Changes saved successfully." });
        const updatedTournament = await res.json();
        
        // Notify parent with updated data
        if (onUpdate) {
            onUpdate({
                ...tournament,
                name: updatedTournament.title,
                description: updatedTournament.description,
                location: updatedTournament.location,
                prizePool: updatedTournament.prizePool,
                maxParticipants: updatedTournament.maxParticipants,
                registrationFee: updatedTournament.registrationFee,
                teamSize: updatedTournament.teamSize,
                imageUrl: updatedTournament.imageUrl,
                status: (updatedTournament.status === "ongoing" ? "Live" : updatedTournament.status === "completed" ? "Completed" : "Registrations Open") as any
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const file = e.target.files[0];
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
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
              <label>Banner Image</label>
              <div className="tm-upload-container">
                <input 
                  type="file" 
                  id="tm-banner-upload"
                  accept="image/*" 
                  onChange={handleBannerChange} 
                  className="tm-file-input"
                />
                <label htmlFor="tm-banner-upload" className="tm-upload-area">
                  {bannerPreview ? (
                    <div className="tm-preview-wrapper">
                      <img src={bannerPreview} alt="Banner Preview" className="tm-banner-img" />
                      <div className="tm-preview-overlay">
                        <Upload size={18} />
                        <span>Replace Banner</span>
                      </div>
                    </div>
                  ) : (
                    <div className="tm-upload-placeholder">
                      <Upload size={20} />
                      <span>Upload Banner</span>
                    </div>
                  )}
                </label>
                {bannerFile && (
                  <button 
                    type="button" 
                    className="tm-reset-upload"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(tournament.imageUrl ? 
                        (tournament.imageUrl.startsWith("http") ? tournament.imageUrl : `http://localhost:5000${tournament.imageUrl}`) : "");
                    }}
                  >
                    <X size={14} /> Reset
                  </button>
                )}
              </div>
              <p className="tm-hint" style={{ marginTop: 8, fontSize: 11 }}>Recommended ratio 16:9. PNG, JPG or WebP.</p>
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

      {activeTab === "bracket" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">Manage the tournament bracket.</div>
          
          {bracketError && <div className="tm-alert tm-alert--error">{bracketError}</div>}
          
          {!bracketData || bracketData.length === 0 ? (
            <div className="tm-gen-choices">
                <div 
                  className={`tm-gen-card ${generatingBracket ? "tm-gen-card--loading" : ""}`} 
                  onClick={!generatingBracket ? handleGenerateBracket : undefined}
                >
                    <div className="tm-gen-icon">
                      {generatingBracket ? <Loader2 size={24} className="tm-spin" /> : <Zap size={24} />}
                    </div>
                    <h3>{generatingBracket ? "Generating..." : "Automatic Generation"}</h3>
                    <p>Randomly seed all confirmed participants into the bracket automatically.</p>
                </div>
                <div className="tm-gen-card" onClick={handleInitializeManualBracket}>
                    <div className="tm-gen-icon"><Layout size={24} /></div>
                    <h3>Manual Generation</h3>
                    <p>Initialize an empty bracket and manually drag teams into their positions.</p>
                </div>
            </div>
          ) : (
            <div className="tm-bracket-view">
               {/* Team Sidebar */}
               <div className="tm-team-sidebar animate-fade-in">
                  <div className="tm-sidebar-header">
                     Unassigned Teams
                     <span className="tm-sidebar-count">{unassignedTeams.length}</span>
                  </div>
                  <div className="tm-sidebar-list">
                     {unassignedTeams.length === 0 ? (
                        <div className="tm-sidebar-empty">All teams assigned</div>
                     ) : (
                        unassignedTeams.map((t, idx) => (
                           <div 
                              key={t.id || idx} 
                              className="tm-draggable-team"
                              draggable
                              onDragStart={(e) => {
                                 e.dataTransfer.setData("application/json", JSON.stringify({ type: 'list', team: t }));
                              }}
                           >
                              <span>{t.name}</span>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {/* Bracket Workspace */}
               <div className="tm-bracket-workspace">
                  <div className="tm-bracket-wrap" style={{ overflowX: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
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
                                if (window.confirm("Are you sure you want to reset the bracket? This will wipe all current match data.")) {
                                    setBracketData(null);
                                    // Optionally call API to clear bracket in DB? 
                                    // handleUpdateBracket(null) or similar.
                                }
                            }}
                        >
                            Reset & Regenerate
                        </button>
                    </div>
                  </div>
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
