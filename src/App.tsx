import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
    <div className="max-w-md space-y-6">
      <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-black uppercase italic text-white">System Failure</h1>
      <p className="text-slate-400 text-sm leading-relaxed">
        An unexpected error has occurred in the tactical interface.
      </p>
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-left">
        <code className="text-[10px] text-red-400 font-mono break-all">{error.message}</code>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase py-4 rounded-xl text-xs"
        >Return Home</button>
        <button 
          onClick={resetErrorBoundary}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase py-4 rounded-xl text-xs"
        >Retry Interface</button>
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;