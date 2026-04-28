import { useState } from "react";
import TopBar from "../components/TopBar";
import { Flame, Stethoscope, ShieldAlert, CheckCircle, Video, ArrowLeft, Siren } from "lucide-react";
import CameraFeed from "../components/CameraFeed";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";
import "./ResponderDashboard.css";

// Master alert pool — each alert has a type that maps to a responder specialization
const ALL_ALERTS = [
  {
    id: 1,
    type: "fire",
    title: "Fire Detected",
    location: "Restaurant - Kitchen Area",
    time: "Just now",
    severity: "critical",
    isRecent: true,
    cameraUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 2,
    type: "fire",
    title: "Smoke Alarm Triggered",
    location: "Server Room - Level 3",
    time: "3 min ago",
    severity: "warning",
    isRecent: false,
    cameraUrl: ""
  },
  {
    id: 3,
    type: "medical",
    title: "Person Collapsed",
    location: "Main Lobby - Entrance",
    time: "2 min ago",
    severity: "critical",
    isRecent: true,
    cameraUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
  },
  {
    id: 4,
    type: "medical",
    title: "Medical Emergency",
    location: "Cafeteria - Ground Floor",
    time: "8 min ago",
    severity: "warning",
    isRecent: false,
    cameraUrl: ""
  },
  {
    id: 5,
    type: "security",
    title: "Unauthorized Access",
    location: "Parking Lot A - Gate 2",
    time: "Just now",
    severity: "critical",
    isRecent: true,
    cameraUrl: ""
  },
  {
    id: 6,
    type: "security",
    title: "Violent Altercation",
    location: "Hallway North - Level 1",
    time: "5 min ago",
    severity: "critical",
    isRecent: false,
    cameraUrl: ""
  }
];

// Maps role → which alert types they can see
const ROLE_CONFIG = {
  fire_responder: {
    types: ["fire"],
    label: "Fire & Rescue",
    subtitle: "Fire & Smoke Incidents",
    Icon: Flame,
    accentClass: "theme-fire",
    emptyMsg: "No active fire or smoke alerts."
  },
  medical_responder: {
    types: ["medical"],
    label: "Medical Response",
    subtitle: "Medical Emergencies",
    Icon: Stethoscope,
    accentClass: "theme-medical",
    emptyMsg: "No active medical alerts."
  },
  security_responder: {
    types: ["security"],
    label: "Security Response",
    subtitle: "Security & Threat Alerts",
    Icon: ShieldAlert,
    accentClass: "theme-security",
    emptyMsg: "No active security alerts."
  },
  // Admin can see all when they browse /alerts
  administrator: {
    types: ["fire", "medical", "security"],
    label: "All Incidents",
    subtitle: "Full Incident Overview",
    Icon: Siren,
    accentClass: "theme-admin",
    emptyMsg: "No active alerts."
  }
};

const TYPE_ICONS = {
  fire: Flame,
  medical: Stethoscope,
  security: ShieldAlert
};

const TYPE_LABELS = {
  fire: "Fire",
  medical: "Medical",
  security: "Security"
};

function AlertCard({ alert, onOpen }) {
  const [resolved, setResolved] = useState(false);
  const TypeIcon = TYPE_ICONS[alert.type] || Siren;

  return (
    <div className={`rd-alert-card severity-${alert.severity} ${alert.isRecent ? "rd-recent" : ""} ${resolved ? "rd-resolved" : ""}`}>
      <div className="rd-alert-header">
        <div className={`rd-type-badge type-${alert.type}`}>
          <TypeIcon size={14} />
          <span>{TYPE_LABELS[alert.type]}</span>
        </div>
        {alert.isRecent && !resolved && <span className="rd-new-tag">NEW</span>}
        {resolved && <span className="rd-resolved-tag"><CheckCircle size={12} /> Resolved</span>}
      </div>
      <div className="rd-alert-body">
        <h3 className="rd-alert-title">{alert.title}</h3>
        <p className="rd-alert-location">{alert.location}</p>
        <p className="rd-alert-time">{alert.time}</p>
      </div>
      <div className="rd-alert-actions">
        {!resolved && (
          <>
            <button className="rd-btn-respond" onClick={() => onOpen(alert)}>
              <Video size={15} /> View Feed & Respond
            </button>
            <button className="rd-btn-resolve" onClick={() => setResolved(true)}>
              <CheckCircle size={15} /> Mark Resolved
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ResponderDashboard() {
  const { user, role } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG["fire_responder"];
  const { Icon, label, subtitle, accentClass, emptyMsg, types } = config;

  const filteredAlerts = ALL_ALERTS.filter(a => types.includes(a.type));

  const criticalCount = filteredAlerts.filter(a => a.severity === "critical").length;

  return (
    <div className={`dashboard-layout rd-layout ${accentClass}`}>
      <TopBar />

      <div className="rd-main">
        {/* Role Header */}
        <div className="rd-role-header">
          <div className="rd-role-icon">
            <Icon size={28} />
          </div>
          <div>
            <h2 className="rd-role-title">{label}</h2>
            <p className="rd-role-subtitle">{subtitle} · Dispatched to {user?.email}</p>
          </div>
          {criticalCount > 0 && (
            <div className="rd-critical-badge">
              <Siren size={14} />
              {criticalCount} Critical
            </div>
          )}
        </div>

        {/* Active Camera View */}
        {activeAlert ? (
          <div className="rd-camera-view">
            <button className="rd-back-btn" onClick={() => setActiveAlert(null)}>
              <ArrowLeft size={16} /> Back to Incidents
            </button>

            <div className={`rd-active-alert-card severity-${activeAlert.severity}`}>
              <div className={`rd-type-badge type-${activeAlert.type}`}>
                {(() => { const I = TYPE_ICONS[activeAlert.type]; return <I size={14} />; })()}
                <span>{TYPE_LABELS[activeAlert.type]}</span>
              </div>
              <h3 className="rd-alert-title" style={{ marginTop: 10 }}>{activeAlert.title}</h3>
              <p className="rd-alert-location">{activeAlert.location}</p>
              <p className="rd-alert-time">Reported: {activeAlert.time}</p>
              <p className="rd-dispatch-text">Dispatched to: {user?.email}</p>
            </div>

            <div className="rd-feed-label">
              <Video size={15} /> Live Camera Feed
            </div>
            <div className="camera-feed-wrapper">
              <CameraFeed url={activeAlert.cameraUrl} isExpanded={true} />
            </div>
          </div>
        ) : (
          /* Incident List */
          <div className="rd-incident-list">
            {filteredAlerts.length === 0 ? (
              <div className="rd-empty">
                <CheckCircle size={40} className="rd-empty-icon" />
                <h3>All Clear</h3>
                <p>{emptyMsg}</p>
              </div>
            ) : (
              <div className="rd-cards-grid">
                {filteredAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onOpen={setActiveAlert} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponderDashboard;
