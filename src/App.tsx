import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { RegistryProvider } from "./components/RegistryProvider";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import AddGame from "./pages/AddGame";
import Settings from "./pages/Settings";
import History from "./pages/History";
import AddSocial from "./pages/AddSocial";
import GameDetail from "./pages/GameDetail";
import Timer from "./pages/Timer";
import GameRegistry from "./pages/GameRegistry";
import CrosshairManager from "./pages/CrosshairManager";
import ConfigManager from "./pages/ConfigManager";
import Achievements from "./pages/Achievements";
import HabitTracker from "./pages/HabitTracker";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Social from "./pages/Social";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import VersionHistory from "./pages/VersionHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RegistryProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/add-game" element={<AddGame />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/history" element={<History />} />
                <Route path="/add-social" element={<AddSocial />} />
                <Route path="/game/:id" element={<GameDetail />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/registry" element={<GameRegistry />} />
                <Route path="/crosshairs" element={<CrosshairManager />} />
                <Route path="/configs" element={<ConfigManager />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/habits" element={<HabitTracker />} />
                <Route path="/social" element={<Social />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/team/:id" element={<TeamDetail />} />
                <Route path="/version-history" element={<VersionHistory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </RegistryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;