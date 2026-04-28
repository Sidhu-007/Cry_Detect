import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useNavigate } from "react-router-dom";
import dashboardImg from '../assets/dashboard.png';
import '../App.css';

function Landing() {
  const navigate = useNavigate();

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="app">
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              fullScreen: { enable: true, zIndex: -1 },
              particles: {
                number: { value: 70, density: { enable: true, value_area: 1000 } },
                color: { value: "#2563eb" },
                links: { enable: true, color: "#2563eb", distance: 160, opacity: 0.05, width: 1 },
                move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false, outModes: "out" },
                size: { value: { min: 1, max: 3 } },
                opacity: { value: 0.05 },
              },
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                },
                modes: {
                  grab: { distance: 180, links: { opacity: 0.4, color: "#2563eb" } },
                }
              }
            }}
            style={{ filter: "blur(1px)" }}
          />
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="6" fill="white" stroke="#e0e0e0" strokeWidth="1"/>
                <circle cx="14" cy="14" r="8" stroke="#2563eb" strokeWidth="2" fill="none"/>
                <line x1="14" y1="6" x2="14" y2="22" stroke="#e53e3e" strokeWidth="2"/>
                <line x1="6" y1="14" x2="22" y2="14" stroke="#e53e3e" strokeWidth="2"/>
              </svg>
            </div>
            <span className="logo-text">CryDetect</span>
          </div>
          <button className="hamburger" id="hamburger-btn" onClick={() => {
            const menu = document.getElementById('nav-menu');
            menu.classList.toggle('open');
          }}>
            <span></span><span></span><span></span>
          </button>
          <div className="nav-links" id="nav-menu">
            <a href="#download">Download</a>
            <a href="#safety">Features</a>
            <a href="#support">Support</a>
            <a href="#team">Team</a>
            <div className="lang-selector">
              <span>🌐</span>
              <span>English</span>
            </div>
            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Detect Fires, Fights & Emergencies — Instantly</h1>
            <p className="hero-description">
              AI monitors all your CCTV feeds and alerts your team the moment something goes wrong.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/login')}>Open CryDetect in your browser</button>
              <button className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download for Windows
              </button>
            </div>
            <p className="trust-line">Monitoring 100+ camera feeds in real-time</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="dashboard-preview-section">
        <div className="hero-dashboard-wrapper">
          <div className="hero-dashboard-header">
            <span className="urgency-text">Most incidents go unnoticed until it’s too late.</span>
            <span className="dashboard-title">See CryDetect in action</span>
            <span className="dashboard-subtext">Real-time alerts and camera monitoring dashboard</span>
          </div>
          <div className="hero-dashboard-container">
            <div className="dashboard-tag tag-fire">🔥 Fire Detected — Kitchen</div>
            <div className="dashboard-tag tag-panic">⚠️ Crowd Panic — Lobby</div>
            <img src={dashboardImg} alt="CryDetect Dashboard" className="dashboard-img" />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="download-section" id="download">
        <div className="section-container">
          <h2 className="section-title">Get Started with CryDetect</h2>
          <p className="section-subtitle">Available on multiple platforms for seamless monitoring</p>
          <div className="download-cards">
            <div className="download-card">
              <div className="download-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3 className="card-title">Windows</h3>
              <p className="card-desc">Full control dashboard for security teams</p>
              <button className="btn-download">Download for Windows</button>
            </div>
            <div className="download-card">
              <div className="download-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3 className="card-title">Android</h3>
              <p className="card-desc">Monitor alerts on the go</p>
              <button className="btn-download">Download for Android</button>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="safety-section" id="safety">
        <div className="section-container centered">
          <div className="section-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
              <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/>
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
            </svg>
          </div>
          <h2 className="section-title">How CryDetect Helps in Emergencies</h2>
          <p className="section-subtitle">Essential precautions to save lives in emergencies</p>
          <div className="safety-cards">
            <div className="safety-card">
              <h3>Fire Emergency</h3>
              <p>AI detects smoke early — enabling faster evacuation</p>
            </div>
            <div className="safety-card">
              <h3>Medical Emergency</h3>
              <p>Instant alerts when someone collapses</p>
            </div>
            <div className="safety-card">
              <h3>Security Threat</h3>
              <p>Detects unusual behavior before escalation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Talk to Our Team / Support Section */}
      <section className="team-section" id="support">
        <div className="section-container centered">
          <div className="section-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h2 className="section-title">Talk to Our Team</h2>
          <p className="section-subtitle">
            Need help? Our dedicated support team is here to assist you with setup, troubleshooting, and<br className="desktop-br" /> any questions.
          </p>
          <button className="btn-contact">
            Contact Support Team
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="footer-logo-box">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="4" fill="white"/>
                <circle cx="14" cy="14" r="8" stroke="#2563eb" strokeWidth="2" fill="none"/>
                <line x1="14" y1="6" x2="14" y2="22" stroke="#e53e3e" strokeWidth="2"/>
                <line x1="6" y1="14" x2="22" y2="14" stroke="#e53e3e" strokeWidth="2"/>
              </svg>
            </div>
            <span className="footer-brand">CryDetect</span>
          </div>
          <div className="footer-links">
            <a href="#">Twitter</a>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
          </div>
          <p className="footer-copy">© 2026 CryDetect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
