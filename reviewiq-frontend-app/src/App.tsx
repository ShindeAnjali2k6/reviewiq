/**
 * Root application component.
 *
 * Sets up React Router with the AppLayout shell and all page routes.
 * The root path redirects to /dashboard since this build focuses on
 * the analytics application (no separate marketing landing page).
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import ContributorsPage from "./pages/ContributorsPage";
import IssuesPage from "./pages/IssuesPage";
import BottlenecksPage from "./pages/BottlenecksPage";
import ClassifierPage from "./pages/ClassifierPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/bottlenecks" element={<BottlenecksPage />} />
          <Route path="/classifier" element={<ClassifierPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
