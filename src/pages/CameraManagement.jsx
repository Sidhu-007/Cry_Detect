import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, db } from "../firebase";
import TopBar from "../components/TopBar";
import { Trash2, Video, Plus, CheckCircle, VideoOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CameraManagement.css";

function CameraManagement() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCamera, setNewCamera] = useState({ name: "", location: "", url: "", status: "online" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "cameras"));
      const camsList = [];
      querySnapshot.forEach((doc) => {
        camsList.push({ id: doc.id, ...doc.data() });
      });
      camsList.sort((a, b) => a.id.localeCompare(b.id));
      setCameras(camsList);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
    setLoading(false);
  };

  const handleAddCamera = async (e) => {
    e.preventDefault();
    if (!newCamera.name || !newCamera.location) return;
    
    try {
      // Generate a simple ID
      const newCamId = `cam_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "cameras", newCamId), {
        name: newCamera.name,
        location: newCamera.location,
        url: newCamera.url,
        status: newCamera.status
      });
      setShowModal(false);
      setNewCamera({ name: "", location: "", url: "", status: "online" });
      fetchCameras();
    } catch (error) {
      console.error("Error adding camera:", error);
    }
  };

  const handleDeleteCamera = async (camId) => {
    if (window.confirm("Are you sure you want to delete this camera?")) {
      try {
        await deleteDoc(doc(db, "cameras", camId));
        fetchCameras();
      } catch (error) {
        console.error("Error deleting camera:", error);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <TopBar />
      
      <div className="cameramanagement-main">
        <div className="page-nav">
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
        <div className="cameramanagement-header">
          <h2>Camera Source Management</h2>
          <button className="btn-add-camera" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Camera
          </button>
        </div>

        <div className="cameras-table-container">
          {loading ? (
            <div className="loading-state">Loading cameras...</div>
          ) : (
            <table className="cameras-table">
              <thead>
                <tr>
                  <th>Camera Details</th>
                  <th>Location</th>
                  <th>Stream URL</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cameras.map(cam => (
                  <tr key={cam.id}>
                    <td>
                      <div className="camera-name-cell">
                        <div className="camera-avatar">
                          <Video size={16} />
                        </div>
                        <span className="cam-name">{cam.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cam-location">{cam.location}</span>
                    </td>
                    <td>
                      <div className="cam-url" title={cam.url}>
                        {cam.url ? (
                          cam.url.length > 40 ? cam.url.substring(0, 40) + "..." : cam.url
                        ) : (
                          <span className="no-url">No URL Assigned</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={`status-badge ${cam.status}`}>
                        {cam.status === "online" ? <CheckCircle size={14} /> : <VideoOff size={14} />}
                        {cam.status}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteCamera(cam.id)}
                        title="Delete camera"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Camera</h3>
            <form onSubmit={handleAddCamera}>
              <div className="form-group">
                <label>Camera Name</label>
                <input 
                  type="text" 
                  value={newCamera.name}
                  onChange={(e) => setNewCamera({...newCamera, name: e.target.value})}
                  placeholder="e.g. Main Lobby Cam"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={newCamera.location}
                  onChange={(e) => setNewCamera({...newCamera, location: e.target.value})}
                  placeholder="e.g. Entrance"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stream URL (Optional initially)</label>
                <input 
                  type="text" 
                  value={newCamera.url}
                  onChange={(e) => setNewCamera({...newCamera, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label>Initial Status</label>
                <select 
                  value={newCamera.status}
                  onChange={(e) => setNewCamera({...newCamera, status: e.target.value})}
                >
                  <option value="online">Online</option>
                  <option value="alert">Alert</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Add Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraManagement;
