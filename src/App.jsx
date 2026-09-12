import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import AccountsPage from "./pages/AccountsPage.jsx";
import SchedulerPage from "./pages/SchedulerPage.jsx";
import AIComposerPage from "./pages/AIComposerPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuthStore } from "./store/authStore.js";

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="scheduler" element={<SchedulerPage />} />
        <Route path="ai-composer" element={<AIComposerPage />} />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
