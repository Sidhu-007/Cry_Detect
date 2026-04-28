import { useState, useEffect } from "react";
import { Camera, Clock, Map as MapIcon, Activity, Maximize2, Settings, ArrowLeft, Trash2 } from "lucide-react";
import CameraFeed from "./CameraFeed";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, doc, updateDoc, db, query, orderBy, limit, onSnapshot } from "../firebase";
import "./CameraGrid.css";

function CameraGrid() {
  const [activeTab, setActiveTab] = useState("cameras");
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCam, setExpandedCam] = useState(null);
  const [editingCam, setEditingCam] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [history, setHistory] = useState([]);
  const { role, location: userLocation } = useAuth();

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "cameras"));
      const camsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // If local_staff, only show cameras that match their assigned location
        if (role === "local_staff" && userLocation && data.location !== userLocation) {
          return;
        }
        camsList.push({ id: doc.id, ...data });
      });
      // Sort by ID to maintain order
      camsList.sort((a, b) => a.id.localeCompare(b.id));
      setCameras(camsList);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab !== "timeline") return;
    
    const q = query(
      collection(db, "alerts"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const alertLocation = data.location || data.cameraId || "Unknown Location";
        
        if (role === "local_staff" && userLocation && alertLocation !== userLocation) {
          return;
        }

        historyList.push({
          id: doc.id,
          title: data.message || "Alert",
          location: alertLocation,
          time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : "Just now",
          status: data.status || "unread",
          image_url: data.image_url,
          image: data.image
        });
      });
      setHistory(historyList);
    });

    return () => unsubscribe();
  }, [activeTab, role, userLocation]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!editingCam) return;
    try {
      await updateDoc(doc(db, "cameras", editingCam.id), { url: editUrl });
      setEditingCam(null);
      fetchCameras();
    } catch (error) {
      console.error("Error saving URL:", error);
    }
  };

  const handleDeleteImage = async (alertId) => {
    try {
      await updateDoc(doc(db, "alerts", alertId), { image: null, image_url: null });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="monitoring-panel">
      <div className="panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'cameras' ? 'active' : ''}`}
          onClick={() => setActiveTab('cameras')}
        >
          <Camera size={18} /> Cameras
        </button>
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={18} /> Timeline
        </button>
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <MapIcon size={18} /> Map
        </button>
      </div>

      <div className="panel-content-wrapper">
        <div className="panel-content">
          {activeTab === 'cameras' && (
            <div className="camera-grid">
              {loading ? (
                <div className="loading-state">Loading camera feeds...</div>
              ) : (
                cameras.map(cam => (
                  <div key={cam.id} className="camera-card">
                    <div className="camera-feed-placeholder" onClick={() => setExpandedCam(cam)}>
                      <CameraFeed url={cam.url} isExpanded={false} />
                      
                      <button className="expand-btn">
                        <Maximize2 size={16} />
                      </button>
                      
                      {cam.status === 'alert' && (
                        <div className="alert-indicator">
                          <Activity size={16} />
                        </div>
                      )}
                      
                      {cam.url && <div className="feed-timestamp">REC • 1080p</div>}
                    </div>
                    <div className="camera-info">
                      <div className="camera-details">
                        <h4>{cam.name}</h4>
                        <span>{cam.location}</span>
                      </div>
                      <div className="camera-actions">
                        {role === "administrator" && (
                          <button 
                            className="btn-edit-source" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCam(cam);
                              setEditUrl(cam.url || "");
                            }}
                            title="Edit Camera Source"
                          >
                            <Settings size={14} />
                          </button>
                        )}
                        <div className={`status-dot ${cam.status}`} title={`Status: ${cam.status}`}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Timeline Tab Content */}
          {activeTab === 'timeline' && (
            <div className="timeline-container">
              <h3 className="timeline-title">Issue History</h3>
              {history.length === 0 ? (
                <p className="timeline-empty">No issues recorded yet.</p>
              ) : (
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className={`history-item status-${item.status}`}>
                      <div className="history-time">{item.time}</div>
                      <div className="history-content">
                        <div className="history-header">
                          <h4>{item.title}</h4>
                          <span className={`badge-status ${item.status}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="history-location">{item.location}</p>
                        {(item.image || item.image_url) && (
                           <div className="history-image-wrapper">
                             <img 
                               src={item.image ? `data:image/jpeg;base64,${item.image}` : item.image_url} 
                               alt="snapshot" 
                               className="history-image" 
                             />
                             <button 
                               className="btn-delete-image" 
                               onClick={() => handleDeleteImage(item.id)}
                               title="Delete Image"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* ... other tabs ... */}
        </div>
      </div>

      {/* Expanded Modal */}
      {expandedCam && (
        <div className="modal-overlay" onClick={() => setExpandedCam(null)}>
          <div className="expanded-camera-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <button className="btn-modal-back" onClick={() => setExpandedCam(null)}>
                  <ArrowLeft size={18} />
                  <span>Back to Grid</span>
                </button>
                <h3>{expandedCam.name} - {expandedCam.location}</h3>
              </div>
            </div>
            <div className="expanded-feed">
              <CameraFeed url={expandedCam.url} isExpanded={true} />
            </div>
          </div>
        </div>
      )}

      {/* Edit URL Modal */}
      {editingCam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Camera Source</h3>
            <p className="modal-subtitle">Update the stream URL for {editingCam.name}.</p>
            <form onSubmit={handleSaveUrl}>
              <div className="form-group">
                <label>Stream URL (YouTube, MP4, M3U8)</label>
                <input 
                  type="text" 
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingCam(null)}>Cancel</button>
                <button type="submit" className="btn-save">Save Source</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraGrid;
