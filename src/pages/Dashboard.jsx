import TopBar from "../components/TopBar";
import AlertPanel from "../components/AlertPanel";
import CameraGrid from "../components/CameraGrid";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <TopBar />
      <div className="dashboard-main">
        <div className="dashboard-left">
          <AlertPanel />
        </div>
        <div className="dashboard-right">
          <CameraGrid />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
