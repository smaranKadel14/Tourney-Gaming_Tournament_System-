import { X, Trophy, Calendar, MapPin, Users, DollarSign, Clock, Gamepad2 } from "lucide-react";
import "./TournamentViewModal.css";

interface TournamentRow {
  id: string;
  name: string;
  game: string;
  date: string;
  status: string;
  participants: number;
  // extended fields from full API response
  endDate?: string;
  location?: string;
  registrationDeadline?: string;
  prizePool?: string;
  description?: string;
  maxParticipants?: number;
  registrationFee?: number;
  imageUrl?: string;
}

interface Props {
  tournament: TournamentRow;
  onClose: () => void;
}

const TournamentViewModal = ({ tournament, onClose }: Props) => {
  return (
    <div className="tvm-overlay" onClick={onClose}>
      <div className="tvm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="tvm-header">
          <div className="tvm-header-left">
            <h2 className="tvm-title">{tournament.name}</h2>
            <p className="tvm-game">{tournament.game}</p>
          </div>
          <button className="tvm-close" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Banner */}
        {tournament.imageUrl && (
          <div className="tvm-banner">
            <img src={tournament.imageUrl} alt="Tournament Banner" onError={e => (e.currentTarget.style.display = "none")} />
          </div>
        )}

        {/* Info grid */}
        <div className="tvm-grid">
          <div className="tvm-info-item">
            <Gamepad2 className="tvm-info-icon" size={16} />
            <div>
              <div className="tvm-info-label">Game</div>
              <div className="tvm-info-value">{tournament.game}</div>
            </div>
          </div>

          <div className="tvm-info-item">
            <Calendar className="tvm-info-icon" size={16} />
            <div>
              <div className="tvm-info-label">Start Date</div>
              <div className="tvm-info-value">{tournament.date}</div>
            </div>
          </div>

          {tournament.endDate && (
            <div className="tvm-info-item">
              <Calendar className="tvm-info-icon" size={16} />
              <div>
                <div className="tvm-info-label">End Date</div>
                <div className="tvm-info-value">
                  {new Date(tournament.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </div>
              </div>
            </div>
          )}

          {tournament.location && (
            <div className="tvm-info-item">
              <MapPin className="tvm-info-icon" size={16} />
              <div>
                <div className="tvm-info-label">Location</div>
                <div className="tvm-info-value">{tournament.location}</div>
              </div>
            </div>
          )}

          {tournament.registrationDeadline && (
            <div className="tvm-info-item">
              <Clock className="tvm-info-icon" size={16} />
              <div>
                <div className="tvm-info-label">Registration Deadline</div>
                <div className="tvm-info-value">
                  {new Date(tournament.registrationDeadline).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </div>
              </div>
            </div>
          )}

          <div className="tvm-info-item">
            <Users className="tvm-info-icon" size={16} />
            <div>
              <div className="tvm-info-label">Participants</div>
              <div className="tvm-info-value">
                {tournament.participants}{tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""}
              </div>
            </div>
          </div>

          {tournament.prizePool && (
            <div className="tvm-info-item">
              <Trophy className="tvm-info-icon" size={16} />
              <div>
                <div className="tvm-info-label">Prize Pool</div>
                <div className="tvm-info-value">{tournament.prizePool}</div>
              </div>
            </div>
          )}

          {tournament.registrationFee !== undefined && (
            <div className="tvm-info-item">
              <DollarSign className="tvm-info-icon" size={16} />
              <div>
                <div className="tvm-info-label">Registration Fee</div>
                <div className="tvm-info-value">
                  {tournament.registrationFee === 0 ? "Free" : `Rs. ${tournament.registrationFee}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {tournament.description && (
          <div className="tvm-section">
            <div className="tvm-section-title">About</div>
            <p className="tvm-section-body">{tournament.description}</p>
          </div>
        )}

        <div className="tvm-footer">
          <button className="tvm-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TournamentViewModal;
