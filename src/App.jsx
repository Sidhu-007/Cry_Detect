import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResponderDashboard from "./pages/ResponderDashboard";
import UserManagement from "./pages/UserManagement";
import CameraManagement from "./pages/CameraManagement";
import './App.css';
import './dark-theme.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  const RESPONDER_ROLES = ["fire_responder", "medical_responder", "security_responder"];

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (RESPONDER_ROLES.includes(role)) return <Navigate to="/alerts" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RoleAwareRedirect = () => {
  const { role } = useAuth();
  const RESPONDER_ROLES = ["fire_responder", "medical_responder", "security_responder"];
  if (RESPONDER_ROLES.includes(role)) return <Navigate to="/alerts" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={["administrator", "operator", "local_staff"]}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute allowedRoles={["administrator", "fire_responder", "medical_responder", "security_responder"]}>
                <ResponderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={["administrator"]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cameras" 
            element={
              <ProtectedRoute allowedRoles={["administrator"]}>
                <CameraManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<RoleAwareRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
