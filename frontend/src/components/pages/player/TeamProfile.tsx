import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api, BASE_URL } from "../../../lib/api";
import { 
    Users, User as UserIcon, Shield, Send, CheckCircle, XCircle, 
    Loader2, LogOut, Trash2, UserPlus, Camera, 
    Trophy, Activity, Calendar, Share2, Edit2, Save, X, MoreVertical
} from "lucide-react";
import { getToken, getAuthUser } from "../../../utils/auth";
import PlayerNavbar from "./PlayerNavbar";
import ImageCropper from "../../common/ImageCropper";
import bg from "../../../assets/home/background.png";
import "./PublicProfile.css"; // Premium Styles
import "./TeamProfile.css";

interface Member {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
}

interface Request {
    _id: string;
    user: Member;
    message: string;
}

interface Team {
    _id: string;
    name: string;
    logoUrl?: string;
    bio?: string;
    captain: Member;
    members: Member[];
    createdAt?: string;
    updatedAt: string;
}

export default function TeamProfile() {
    const { id } = useParams();
    const currentUser = getAuthUser();
    const token = getToken();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [team, setTeam] = useState<Team | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestMsg, setRequestMsg] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Premium UI State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", bio: "" });
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    useEffect(() => {
        fetchTeam();
    }, [id || ""]);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/teams/${id}`);
            setTeam(res.data);

            // If current user is captain, fetch join requests
            if (res.data.captain._id === currentUser?.id) {
                const reqRes = await api.get(`/teams/${id}/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRequests(reqRes.data);
            }
            setEditForm({ name: res.data.name, bio: res.data.bio || "" });
        } catch (err) {
            console.error("Error fetching team:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async () => {
        if (!requestMsg.trim()) return;
        setSendingRequest(true);
        try {
            await api.post(`/teams/${id}/join`, { message: requestMsg }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Join request sent successfully!");
            setRequestMsg("");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to send request");
        } finally {
            setSendingRequest(false);
        }
    };

    const handleRemoveLogo = async () => {
        try {
            await api.put(`/teams/${id}`, { logoUrl: "" }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTeam();
        } catch (err) {
            console.error("Failed to remove logo", err);
        }
    };

    const handleUploadLogo = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const formData = new FormData();
        formData.append("logo", croppedBlob, "logo.jpg");

        try {
            await api.post(`/teams/${id}/logo`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            fetchTeam();
            setImageToCrop(null);
        } catch (err: any) {
            console.error("Failed to upload logo", err);
            alert("Found an issue uploading the image.");
        }
    };

    const handleCropCancel = () => setImageToCrop(null);

    const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
        setActionLoading(requestId);
        try {
            await api.patch(`/teams/${id}/requests/${requestId}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(prev => prev.filter(r => r._id !== requestId));
            if (status === 'accepted') fetchTeam();
        } catch (err) {
            console.error("Failed to handle request:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await api.put(`/teams/${id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchTeam();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update team");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKick = async (memberId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to kick ${name} from the team?`)) return;
        setActionLoading(memberId);
        try {
            await api.delete(`/teams/${id}/members/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTeam();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to kick member");
        } finally {
            setActionLoading(null);
        }
    };

    const handleTransferCaptain = async (memberId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to transfer captainship to ${name}? You will lose management permissions.`)) return;
        setActionLoading(memberId);
        try {
            await api.patch(`/teams/${id}/captain`, { newCaptainId: memberId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTeam();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to transfer captainship");
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm("Are you sure you want to leave this team?")) return;
        setSendingRequest(true);
        try {
            await api.post(`/teams/${id}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.href = "/player/community";
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to leave team");
        } finally {
            setSendingRequest(false);
        }
    };

    if (loading) return (
        <div className="pt-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Loader2 size={48} color="#a200ff" className="animate-spin" />
        </div>
    );

    if (!team) return (
        <div className="pt-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#fff' }}>Team Not Found</h2>
        </div>
    );

    const isCaptain = team.captain._id === currentUser?.id;
    const isMember = team.members.some(m => m._id === currentUser?.id);

    return (
        <div className="pt-page">
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept="image/*" 
                onChange={handleFileChange} 
            />

            <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
            <div className="pt-overlay" />

            <div className="pt-wrap">
                <PlayerNavbar />

                <div className="pubprof-container">
                    
                    {/* Team Header */}
                    <div className="pubprof-header">
                        <div className="pubprof-avatar-wrap team-prof-logo" style={{ borderRadius: '16px' }}>
                            {team.logoUrl ? (
                                <img 
                                    src={`${BASE_URL}${team.logoUrl}?t=${new Date(team.updatedAt).getTime()}`} 
                                    alt={team.name} 
                                    className="pubprof-avatar" 
                                    style={{ borderRadius: '16px' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "";
                                        (e.target as HTMLImageElement).style.display = "none";
                                        (e.target as HTMLImageElement).parentElement?.classList.add("fallback-active");
                                    }}
                                />
                            ) : null}
                            
                            <div className="pubprof-avatar-fallback avatar-placeholder" style={{ borderRadius: '16px', display: team.logoUrl ? 'none' : 'flex' }}>
                                <Users size={64} />
                            </div>

                            {/* Edit Logo Overlay (Only for Captain) */}
                            {isCaptain && (

                                <div className="avatar-edit-overlay">
                                    <button className="avatar-action-btn" onClick={handleUploadLogo} title="Change Logo">
                                        <Camera size={20} />
                                    </button>
                                    {team.logoUrl && (
                                        <button className="avatar-action-btn danger" onClick={handleRemoveLogo} title="Remove Logo">
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pubprof-info">
                            {isEditing ? (
                                <div style={{ marginBottom: 12 }}>
                                    <input 
                                        type="text" 
                                        className="edit-input" 
                                        value={editForm.name} 
                                        onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                                    />
                                    <textarea 
                                        className="edit-textarea" 
                                        value={editForm.bio} 
                                        placeholder="Tell us about your team..."
                                        onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="pubprof-name-row">
                                        <h1 className="pubprof-name">{team.name}</h1>
                                    </div>
                                    <div className="pubprof-meta" style={{ marginBottom: 8 }}>
                                        <div className="pubprof-meta-item">
                                            <Shield size={14} /> CAPTAIN: {team.captain.fullName}
                                        </div>
                                        <div className="pubprof-meta-item">
                                            <Calendar size={14} /> Team Profile
                                        </div>
                                    </div>
                                    <div style={{ color: '#cbd5e1', fontSize: 14 }}>
                                        {team.bio || "This team hasn't added a biography yet. Building a legacy, one tournament at a time."}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pubprof-actions">
                            {isEditing ? (
                                <>
                                    <button className="pubprof-btn pubprof-btn-secondary" onClick={() => setIsEditing(false)}>
                                        <X size={16} /> Cancel
                                    </button>
                                    <button className="pubprof-btn pubprof-btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="pubprof-btn pubprof-btn-secondary">
                                        <Share2 size={16} /> Share
                                    </button>
                                    {isCaptain ? (
                                        <button className="pubprof-btn pubprof-btn-primary" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={16} /> Edit Team
                                        </button>
                                    ) : !isMember ? (
                                        <button className="pubprof-btn pubprof-btn-primary" onClick={() => document.getElementById('join-msg-area')?.focus()}>
                                            <UserPlus size={16} /> Join Team
                                        </button>
                                    ) : (
                                        <button className="pubprof-btn pubprof-btn-primary danger" style={{ background: '#ef4444' }} onClick={handleLeave}>
                                            <LogOut size={16} /> Leave
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pubprof-body">
                        <div className="pubprof-left" style={{ gridColumn: '1 / -1' }}>
                            
                            {/* Team Stats Row */}
                            <div className="pubprof-stats-row">
                                <div className="pubprof-stat-card">
                                    <Users size={60} color="#a200ff" />
                                    <div className="pubprof-stat-label">Roster Size</div>
                                    <div className="pubprof-stat-value">{team.members.length}</div>
                                    <div className="pubprof-stat-sub" style={{ color: '#ffaa44' }}>Active Members</div>
                                </div>
                                
                                <div className="pubprof-stat-card">
                                    <Activity size={60} color="#a200ff" />
                                    <div className="pubprof-stat-label">Team Type</div>
                                    <div className="pubprof-stat-value" style={{ fontSize: '24px' }}>Competitive</div>
                                    <div className="pubprof-stat-sub" style={{ color: '#a200ff' }}>Roster Rank</div>
                                </div>

                                <div className="pubprof-stat-card">
                                    <Calendar size={60} color="#a200ff" />
                                    <div className="pubprof-stat-label">Founded</div>
                                    <div className="pubprof-stat-value" style={{ fontSize: '24px' }}>
                                        {team.createdAt ? new Date(team.createdAt).getFullYear() : new Date().getFullYear()}
                                    </div>
                                    <div className="pubprof-stat-sub" style={{ color: '#94a3b8' }}>Established</div>
                                </div>

                                <div className="pubprof-stat-card">
                                    <Trophy size={60} color="#a200ff" />
                                    <div className="pubprof-stat-label">Wins</div>
                                    <div className="pubprof-stat-value">0</div>
                                    <div className="pubprof-stat-sub" style={{ color: '#94a3b8' }}>Hall of Fame</div>
                                </div>
                            </div>

                            <div className="team-prof-grid">
                                {/* Roster Panel */}
                                <div className="pubprof-panel">
                                    <div className="pubprof-panel-header">
                                        <h2 className="pubprof-panel-title">Active Roster</h2>
                                    </div>
                                    <div className="team-roster">
                                        {team.members.map(member => (
                                            <div key={member._id} className="member-card-wrapper">
                                                <Link to={`/player/profile/${member._id}`} className="member-card-link">
                                                    <div className="member-avatar">
                                                        {member.avatarUrl ? (
                                                            <img src={`http://localhost:5000${member.avatarUrl}`} alt="" />
                                                        ) : (
                                                            <UserIcon size={20} color="#64748b" />
                                                        )}
                                                    </div>
                                                    <div className="member-info">
                                                        <span>{member.fullName}</span>
                                                        {member._id === team.captain._id && (
                                                            <span className="role-tag"><Shield size={10} /> Captain</span>
                                                        )}
                                                    </div>
                                                </Link>

                                                {isCaptain && member._id !== currentUser?.id && (
                                                    <div className="member-menu-container">
                                                        <button 
                                                            className={`member-menu-trigger ${activeMenu === member._id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setActiveMenu(activeMenu === member._id ? null : member._id);
                                                            }}
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        
                                                        {activeMenu === member._id && (
                                                            <div className="member-dropdown">
                                                                <button 
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        handleTransferCaptain(member._id, member.fullName);
                                                                        setActiveMenu(null);
                                                                    }}
                                                                >
                                                                    <UserPlus size={14} /> Promote to Captain
                                                                </button>
                                                                <button 
                                                                    className="dropdown-item danger"
                                                                    onClick={() => {
                                                                        handleKick(member._id, member.fullName);
                                                                        setActiveMenu(null);
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} /> Kick Member
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                {/* Join Requests Panel (Only for Captain) */}
                                {isCaptain && (
                                    <div className="pubprof-panel">
                                        <div className="pubprof-panel-header">
                                            <h2 className="pubprof-panel-title">Pending Requests</h2>
                                        </div>
                                        {requests.length === 0 ? (
                                            <div style={{ color: '#64748b', padding: '10px' }}>No pending join requests.</div>
                                        ) : (
                                            requests.map(req => (
                                                <div key={req._id} className="request-card">
                                                    <div className="request-header">
                                                        <div className="member-avatar" style={{width: 32, height: 32}}>
                                                            {req.user.avatarUrl ? <img src={`http://localhost:5000${req.user.avatarUrl}`} alt="" /> : <UserIcon size={16} />}
                                                        </div>
                                                        <span style={{color: 'white', fontWeight: 600}}>{req.user.fullName}</span>
                                                    </div>
                                                    <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '0.5rem 0'}}>{req.message}</p>
                                                    <div className="request-actions">
                                                        <button className="btn-accept" onClick={() => handleRequestAction(req._id, 'accepted')} disabled={!!actionLoading}>
                                                            {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        </button>
                                                        <button className="btn-reject" onClick={() => handleRequestAction(req._id, 'rejected')} disabled={!!actionLoading}>
                                                            {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Join Form (For Non-Members) */}
                                {!isMember && !isCaptain && (
                                    <div className="pubprof-panel">
                                        <div className="pubprof-panel-header">
                                            <h2 className="pubprof-panel-title">Join this Team</h2>
                                        </div>
                                        <textarea 
                                            id="join-msg-area"
                                            placeholder="Tell the captain why you want to join..."
                                            className="edit-textarea"
                                            style={{ width: '100%', height: '100px', fontSize: '0.9rem', marginBottom: '1rem' }}
                                            value={requestMsg}
                                            onChange={(e) => setRequestMsg(e.target.value)}
                                        />
                                        <button className="pubprof-btn pubprof-btn-primary" onClick={handleJoinRequest} disabled={sendingRequest || !requestMsg.trim()}>
                                            {sendingRequest ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                            Send Join Request
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {imageToCrop && (
                <ImageCropper 
                    imageSrc={imageToCrop} 
                    onCropComplete={handleCropComplete} 
                    onCancel={handleCropCancel} 
                />
            )}
        </div>
    );
}
