import { useEffect } from "react";
import { useLauncherStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { HomeView } from "./components/HomeView";
import { AdvancedView } from "./components/AdvancedView";
import { TroubleshootView } from "./components/TroubleshootView";
import { VersionView } from "./components/VersionView";
import { ToolsView } from "./components/ToolsView";
import { ConsoleView } from "./components/ConsoleView";
import { SettingsView } from "./components/SettingsView";

export function App() {
  const { init, activeTab } = useLauncherStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Left Vertical Navigation */}
      <Sidebar />

      {/* Dynamic Main Content Tab */}
      <main className="flex-1 flex overflow-hidden bg-[var(--bg-app)] relative transition-colors duration-200">
        {activeTab === "home" && <HomeView />}
        {activeTab === "advanced" && <AdvancedView />}
        {activeTab === "troubleshoot" && <TroubleshootView />}
        {activeTab === "versions" && <VersionView />}
        {activeTab === "tools" && <ToolsView />}
        {activeTab === "console" && <ConsoleView />}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}

export default App;
