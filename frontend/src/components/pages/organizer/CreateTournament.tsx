import { useState, useEffect } from "react";
import "./CreateTournament.css";
import { getToken } from "../../../utils/auth";

interface Game {
  _id: string;
  title: string;
}

const CreateTournament = ({ onSuccess }: { onSuccess: () => void }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    game: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    registrationDeadline: "",
    prizePool: "",
    registrationFee: 0,
    rules: "",
    maxParticipants: 0,
    imageUrl: "",
    status: "upcoming",
  });

  useEffect(() => {
    // Fetch games for dropdown
    const fetchGames = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/games");
        const data = await res.json();
        setGames(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, game: data[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch games", err);
      }
    };
    fetchGames();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create tournament");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ct-container">
      <div>
        <h2 className="ct-title">Create New Tournament</h2>
        <p className="ct-subtitle">Fill in the details below to set up a new event.</p>
      </div>
      {error && <div className="ct-error">{error}</div>}
      <form onSubmit={handleSubmit} className="ct-form">
        
        <div className="ct-grid">
          <div className="ct-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required placeholder="Summer Championship" />
          </div>
          
          <div className="ct-group">
            <label>Game</label>
            <select name="game" value={formData.game} onChange={handleChange} required>
              {games.map(g => (
                <option key={g._id} value={g._id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="ct-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>

          <div className="ct-group">
            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} required placeholder="Online or Address" />
          </div>

          <div className="ct-group">
            <label>Start Date</label>
            <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>

          <div className="ct-group">
            <label>End Date</label>
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>

          <div className="ct-group">
            <label>Registration Deadline</label>
            <input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required />
          </div>

          <div className="ct-group">
            <label>Max Participants (0 for unlimited)</label>
            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} min="0" required />
          </div>

          <div className="ct-group">
            <label>Prize Pool</label>
            <input name="prizePool" value={formData.prizePool} onChange={handleChange} placeholder="e.g. $500, TBA" />
          </div>

          <div className="ct-group">
            <label>Registration Fee (eSewa Amount)</label>
            <input type="number" name="registrationFee" value={formData.registrationFee} onChange={handleChange} min="0" placeholder="0 for free" required />
          </div>

          <div className="ct-group ct-full-width">
            <label>Tournament Banner Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} required placeholder="https://example.com/banner.jpg" />
            <div className="ct-help-text">Provide a direct web link to a banner image (e.g. from Imgur or Discord). Recommended ratio 16:9.</div>
            {formData.imageUrl && (
              <div className="ct-image-preview">
                 <img 
                    key={formData.imageUrl}
                    src={formData.imageUrl} 
                    alt="Banner Preview" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                        }
                    }} 
                 />
                 <span style={{ display: 'none', color: '#ef4444' }}>Invalid Image URL</span>
              </div>
            )}
          </div>
        </div>

        <div className="ct-group ct-full-width">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="Tournament details..." />
        </div>

        <div className="ct-group ct-full-width">
          <label>Rules</label>
          <textarea name="rules" value={formData.rules} onChange={handleChange} rows={3} placeholder="Tournament rules..." />
        </div>

        <div className="ct-actions">
          <button type="submit" className="ct-submit-btn" disabled={loading}>
            <span>{loading ? "Creating... ⏳" : "Create Tournament"}</span>
            {!loading && <span style={{fontSize: "1.2rem"}}></span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;
