import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, db } from "../firebase";
import TopBar from "../components/TopBar";
import { Trash2, UserPlus, Shield, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", role: "fire_responder", password: "", location: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cameras"));
      const locs = new Set();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.location) locs.add(data.location);
      });
      setLocations(Array.from(locs));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    
    try {
      // In a real app, we would use Firebase Admin SDK or Cloud Functions to create the user account
      // For demo purposes, we will just add the user record to Firestore mock
      const newUserId = `uid_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "users", newUserId), {
        email: newUser.email,
        role: newUser.role,
        displayName: newUser.email.split("@")[0],
        location: newUser.role === "local_staff" ? newUser.location : null
      });
      setShowModal(false);
      setNewUser({ email: "", role: "fire_responder", password: "", location: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <TopBar />
      
      <div className="usermanagement-main">
        <div className="page-nav">
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
        <div className="usermanagement-header">
          <h2>User Management</h2>
          <button className="btn-add-user" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Add User
          </button>
        </div>

        <div className="users-table-container">
          {loading ? (
            <div className="loading-state">Loading users...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-email-cell">
                        <div className="user-avatar">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`role-badge ${user.role || 'operator'}`}>
                        {user.role || 'operator'}
                      </div>
                      {user.role === 'local_staff' && <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280', fontWeight: '600'}}>{user.location}</div>}
                    </td>
                    <td>
                      <span className="status-active">Active</span>
                    </td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === 'admin'}
                        title={user.email === 'admin' ? "Cannot delete primary admin" : "Delete user"}
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
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="administrator">Administrator</option>
                  <option value="operator">Operator</option>
                  <option value="local_staff">👨‍💼 Local Staff (Location Restricted)</option>
                  <option value="fire_responder">🔥 Fire Responder</option>
                  <option value="medical_responder">🏥 Medical Responder</option>
                  <option value="security_responder">🛡️ Security Responder</option>
                </select>
              </div>
              
              {newUser.role === "local_staff" && (
                <div className="form-group">
                  <label>Assigned Location</label>
                  <select 
                    value={newUser.location}
                    onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                    required
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
