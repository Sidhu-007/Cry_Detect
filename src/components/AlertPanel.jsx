import { useState, useEffect } from "react";
import { AlertCircle, Flame, Users, Eye, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, orderBy, limit, onSnapshot, db, doc, updateDoc } from "../firebase";
import "./AlertPanel.css";

const initialAlerts = [
  {
    id: 2,
    type: "panic",
    title: "Crowd Panic",
    location: "Main Lobby",
    time: "11:06 PM",
    severity: "warning",
    isRecent: false
  }
];

const newIncomingAlert = {
  id: 1,
  type: "fire",
  title: "Fire Detected",
  location: "Restaurant - Kitchen Area",
  time: "Just now",
  severity: "critical",
  isRecent: true
};

function AlertCard({ alert }) {
  const { role } = useAuth();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const status = alert.status || "unread";
  const isAcknowledged = status === "acknowledged" || status === "escalated";
  const isEscalated = status === "escalated";

  const handleUpdateStatus = async (newStatus) => {
    if (!alert.id) return;
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, "alerts", alert.id), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
    setIsActionLoading(false);
  };

  const statusClass = isAcknowledged ? "acknowledged" : "";
  const recentClass = alert.isRecent && !isAcknowledged ? "recent-alert pulse-subtle" : "";

  return (
    <div className={`alert-card severity-${alert.severity} ${statusClass} ${recentClass}`}>
      <div className="alert-card-header">
        <div className="alert-info">
          <div className="alert-icon-wrapper">
            {alert.type === "fire" ? <Flame size={20} /> : <Users size={20} />}
          </div>
          <div>
            <h3 className="alert-title">
              {alert.title}
              {status === "acknowledged" && <span className="ack-label">Tasked by Staff</span>}
              {status === "escalated" && <span className="ack-label" style={{background: "#fecaca", color: "#991b1b"}}>Escalated</span>}
            </h3>
            <p className="alert-location">{alert.location}</p>
          </div>
        </div>
        <span className="alert-time">{alert.time}</span>
      </div>
      
      <div className="alert-actions" style={{ flexWrap: 'wrap' }}>
        {status === "unread" && (
          <button 
            className="btn-action btn-ack" 
            onClick={() => handleUpdateStatus("acknowledged")}
            disabled={isActionLoading}
          >
            {isActionLoading ? <Loader2 size={16} className="spin-icon" /> : "Task to Staff"}
          </button>
        )}
        
        <button 
          className="btn-action btn-resolve" 
          onClick={() => handleUpdateStatus("resolved")}
          disabled={isActionLoading}
        >
          <CheckCircle size={16} /> Resolve
        </button>

        <button 
          className="btn-action" 
          style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}
          onClick={() => handleUpdateStatus("ignored")}
          disabled={isActionLoading}
        >
          <XCircle size={16} /> Ignore
        </button>

        {!isEscalated ? (
          <button 
            className="btn-action btn-escalate" 
            onClick={() => handleUpdateStatus("escalated")}
            disabled={isActionLoading}
          >
            <AlertCircle size={16} /> Emergency
          </button>
        ) : (
          <span className="escalated-label"><AlertCircle size={16} /> Emergency Notified</span>
        )}
        
        <button className="btn-action btn-view" onClick={() => setShowImage(!showImage)}>
          <Eye size={16} /> {showImage ? "Hide Feed" : "View Feed"}
        </button>
      </div>

      {showImage && (alert.image || alert.image_url) && (
        <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <img 
            src={alert.image ? `data:image/jpeg;base64,${alert.image}` : alert.image_url} 
            alt="Alert Feed Snapshot" 
            style={{ width: '100%', display: 'block' }} 
          />
        </div>
      )}
      {showImage && !alert.image && !alert.image_url && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          <p>No snapshot available for this alert.</p>
        </div>
      )}
    </div>
  );
}

function AlertPanel() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const { role, location: userLocation } = useAuth();

  useEffect(() => {
    // Listen to real-time YOLO alerts from Firestore
    const q = query(
      collection(db, "alerts"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveAlerts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== "resolved" && data.status !== "ignored") {
          const alertLocation = data.location || data.cameraId || "Unknown Location";
          
          if (role === "local_staff" && userLocation && alertLocation !== userLocation) {
            return; // Skip alerts not belonging to the staff's location
          }

          liveAlerts.push({
            id: doc.id,
            type: (data.type || "").toLowerCase().includes("fire") ? "fire" : "smoke", // dynamic mapping based on python script

            title: data.message || "Alert",
            location: alertLocation,
            time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : "Just now",
            severity: "critical",
            isRecent: true,
            status: data.status || "unread",
            ...data
          });
        }
      });
      
      // If there are real alerts from DB, show them. Otherwise keep the demo placeholders.
      if (liveAlerts.length > 0) {
        setAlerts(liveAlerts);
      }
    }, (error) => {
      console.error("Error listening to alerts:", error);
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <div className="header-title">
          <AlertCircle size={20} className="text-red" />
          <h2>Live Alerts</h2>
        </div>
        <div className="alert-badge">{alerts.length}</div>
      </div>
      
      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={32} className="empty-icon" />
            <h3>No active incidents</h3>
            <p>All monitoring systems are normal.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
}

export default AlertPanel;
