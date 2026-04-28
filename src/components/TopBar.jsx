import { useState, useEffect } from "react";
import { LogOut, Moon, Sun, ShieldAlert, Users, Video } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { auth, signOut, db, collection, query, orderBy, limit, onSnapshot } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./TopBar.css";

function TopBar() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, () => {
      setSecondsAgo(0);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleUsers = () => {
    navigate("/users");
  };

  const handleCameras = () => {
    navigate("/cameras");
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <ShieldAlert size={28} className="logo-icon-main" />
        </div>
        <div className="topbar-titles">
          <h1>{role === "responder" ? "Incident Response" : "Security Control Center"}</h1>
          <span>{role === "responder" ? "Active Dispatch" : "CCTV Monitoring System"}</span>
        </div>
      </div>
      
      <div className="topbar-center">
        <span className="org-name">Lochan security and Co</span>
      </div>

      <div className="topbar-right">
        {role === "administrator" && (
          <>
            <button className="icon-btn" onClick={handleCameras} title="Camera Management">
              <Video size={20} />
            </button>
            <button className="icon-btn" onClick={handleUsers} title="User Management">
              <Users size={20} />
            </button>
          </>
        )}
        {role !== "responder" && (
          <>
            <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="system-status-container">
              <div className="status-badge">
                <div className="status-dot-pulse"></div>
                <span>System Active</span>
              </div>
              <span className="last-updated">Last updated: {secondsAgo} sec ago</span>
            </div>

            <div className="datetime-display">
              <div className="date">{format(currentTime, "EEEE, MMMM d, yyyy")}</div>
              <div className="time">{format(currentTime, "h:mm:ss a")}</div>
            </div>
          </>
        )}
        <button className="btn-exit" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
