# CryDetect - Security Control Center

Welcome to the CryDetect Dashboard, an advanced monitoring and alert management system for real-time camera feeds and incident reporting.

## 🌐 Live Demo
You can access the live dashboard here: **[CryDetect Live Dashboard](https://cry-detect.vercel.app/dashboard)**

---

## 🔐 Admin Access Credentials
To access the full features of the application, please use the following demo credentials:

- **Email / Username:** `admin@gmail.com`
- **Password:** `admin@123`

*(Note: You can also sign in securely via Google if your email has been authorized by the administrator).*

---

## 📖 How to Use the App

### 1. Logging In
Navigate to the live link provided above. Use the admin credentials to log into the system. Upon successful login, you will be redirected to the main monitoring dashboard.

### 2. Main Dashboard & Monitoring
- **Camera Grid:** View all live camera feeds across your facility. If a camera detects an issue, its status indicator will flash red. 
- **Expand Feeds:** Click on the "Expand" icon on any camera feed to view it in full screen for closer inspection.
- **Camera Management:** As an administrator, you can update the source URL (e.g., YouTube Live links, MP4, or M3U8 streams) for any camera directly from the grid by clicking the Settings/Gear icon.

### 3. Timeline & History
- Click on the **Timeline** tab to view a chronological log of all recent alerts and detected incidents.
- Each log entry contains the timestamp, location, and snapshot image of the incident.
- You can clear individual snapshot images from the history by hovering over the image and clicking the red Trash icon.

### 4. Interactive Map
- Switch to the **Map** tab to view the physical locations of your cameras. 
- Cameras are represented by markers. A red marker indicates an active alert at that location, allowing for quick spatial awareness of incidents.

### 5. Managing Users & Access (Admin Only)
- Use the sidebar navigation to go to the **User Management** panel.
- Here you can add new responders or staff, assign their roles (e.g., Administrator, Operator, Local Staff, Fire/Medical Responder), and define their specific operating locations.

### 6. Incident Response
- Responders have access to a dedicated **Responder Dashboard** where they can view active alerts assigned to them.
- They can acknowledge, update the status, or resolve incidents directly from their interface, keeping the entire security team synchronized.

---

## 🛠️ Technology Stack
- **Frontend:** React (v19), Vite
- **Routing:** React Router DOM
- **Authentication & Database:** Firebase
- **Media:** HLS.js (for live stream handling)
- **Styling:** Custom AMOLED Dark Theme + CSS Variables
- **Icons:** Lucide React
