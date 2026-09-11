import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Overview from "./pages/Overview";
import Cameras from "./pages/Cameras";
import LiveCamera from "./pages/LiveCamera";
import TeamRoster from "./pages/TeamRoster";
import SystemStatus from "./pages/SystemStatus";
import { RosterProvider } from "./context/RosterContext";

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Overview",
    subtitle: "Real-time summary of border camera activity",
  },
  "/cameras": {
    title: "Cameras",
    subtitle: "Feed status and detection detail for every camera",
  },
  "/live": {
    title: "Live Camera",
    subtitle: "Real face recognition using your device camera, run entirely in-browser",
  },
  "/roster": {
    title: "Team Roster",
    subtitle: "Enroll faces for the live camera to recognize",
  },
  "/system": {
    title: "System Status",
    subtitle: "Health of the surveillance pipeline and network links",
  },
};

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const info = pageInfo[location.pathname] ?? pageInfo["/"];

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={info.title}
          subtitle={info.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/live" element={<LiveCamera />} />
            <Route path="/roster" element={<TeamRoster />} />
            <Route path="/system" element={<SystemStatus />} />
          </Routes>
        </main>

        <footer className="border-t border-line px-4 py-4 text-center text-xs text-ink-faint sm:px-6">
          BorderWatch AI · Smart India Hackathon prototype · Running in demo mode with mock data
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Shell />
      </BrowserRouter>
    </RosterProvider>
  );
}
