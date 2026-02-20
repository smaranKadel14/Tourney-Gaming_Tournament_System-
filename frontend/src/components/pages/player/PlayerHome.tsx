import "./PlayerHome.css";
import bg from "../../../assets/bg.png";
import gamerImg from "../../../assets/home/gamer.png";
import codImg from "../../../assets/home/COD.png";
import PlayerNavbar from "./PlayerNavbar";

export default function PlayerHome() {
  return (
    <div className="ph">
      {/* Background image */}
      <div className="ph__bg" style={{ backgroundImage: `url(${bg})` }} />
      {/* Overlays */}
      <div className="ph__overlay" />

      <div className="ph__wrap">
        <PlayerNavbar />

        {/* HERO SECTION */}
        <section className="ph__hero">
          <h1 className="ph__title">WEBSITE NAME</h1>
          <p className="ph__subtitle">Lorem Ipsum Text</p>

          <div className="ph__hero-content">
            <div className="ph__hero-left">
              <img src={gamerImg} alt="Gamer" />
            </div>
            
            <div className="ph__hero-right">
              <div className="ph__hero-block">
                <h2>Lorem Ipsum<br/>FGF Playoff</h2>
                <p>
                  Lorem Ipsum Dolor Sit Amet, Consectetuer Adipiscing Elit. Duis Pulvinar. Donec Ipsum Massa, Ullamcorper In,
                  Auctor Et, Scelerisque Sed, Est. Nulla Accumsan, Elit Sit Amet Varius Semper, Nulla Mauris Mollis Quam, Tempor
                  Suscipit Diam Nulla Vel Leo. Vivamus Luctus Egestas Leo. Nullam Sit Amet Magna In Magna Gravida
                  Vehicula. In Enim A Arcu Imperdiet Malesuada. Sed Elit Dui, Pellentesque A, Faucibus Vel, Interdum Nec, Diam.
                  In Rutrum. Sed Ac Dolor Sit Amet Purus Malesuada Congue.
                </p>
              </div>

              <div className="ph__hero-block">
                <h2>Lorem Ipsum<br/>FGF Playoff</h2>
                <p>
                  Lorem Ipsum Dolor Sit Amet, Consectetuer Adipiscing Elit. Duis Pulvinar. Donec Ipsum Massa, Ullamcorper In,
                  Auctor Et, Scelerisque Sed, Est. Nulla Accumsan, Elit Sit Amet Varius Semper, Nulla Mauris Mollis Quam, Tempor
                  Suscipit Diam Nulla Vel Leo. Vivamus Luctus Egestas Leo. Nullam Sit Amet Magna In Magna Gravida
                  Vehicula. In Enim A Arcu Imperdiet Malesuada. Sed Elit Dui, Pellentesque A, Faucibus Vel, Interdum Nec, Diam.
                  In Rutrum. Sed Ac Dolor Sit Amet Purus Malesuada Congue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED GAME SECTION */}
        <section className="ph__section">
          <div className="ph__sectionHead">
            <h2>RELEASED <span>GAMES</span></h2>
            <p>
              Lorem Ipsum Dolor Sit Amet, Consectetuer Adipiscing Elit. Itaque Earum Rerum Hic Tenetur A Sapiente Delectus, Ut Aut
              <br/>Reiciendis Voluptatibus Maiores Alias Consequatur Aut Perferendis Doloribus Asperiores Repellat.
            </p>
          </div>

          <div className="ph__featured-content">
            <div className="ph__featured-left">
              <img src={codImg} alt="Call of Duty" />
            </div>
            
            <div className="ph__featured-right">
              <h3>CALL OF DUTY</h3>
              
              <div className="ph__meta-list">
                <p><strong>Tournament Info:</strong> August 8, 2028, 10pm, Lost Angeles</p>
                <p><strong>Register:</strong> Until August 6, 2028, 8am</p>
                <p><strong>Lorem Ipsum Dolor Sit Amet:</strong> Nulla Turpis Magna, Cursus Sit Amet</p>
                <p><strong>Lorem Ipsum Dolor:</strong> Magna, Cursus Sit Amet</p>
                <p><strong>Sit Amet:</strong> Cursus Sit Amet</p>
              </div>

              <button className="ph__btnPrimary">REGISTER NOW</button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ph__footer" id="contact">
          <div className="ph__social">
            <span>f</span>
            <span>t</span>
            <span>G+</span>
          </div>
          <p className="ph__copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
