import { Link } from "react-router-dom";
import PlayerNavbar from "./PlayerNavbar";

export default function PaymentFailure() {
  return (
    <div className="pt-page" style={{ textAlign: "center", paddingTop: "150px" }}>
      <PlayerNavbar />
      <h1 style={{ color: "#ff4444", fontSize: "3rem", marginBottom: "1rem" }}>Payment Failed</h1>
      <p style={{ color: "#ccc", fontSize: "1.2rem", marginBottom: "2rem" }}>
        We couldn't process your eSewa payment. Please try again or contact support if the issue persists.
      </p>
      <Link to="/player/tournaments" style={{
         padding: "12px 24px",
         background: "#a200ff",
         color: "white",
         textDecoration: "none",
         borderRadius: "8px",
         fontWeight: "bold"
      }}>
        Back to Tournaments
      </Link>
    </div>
  );
}
