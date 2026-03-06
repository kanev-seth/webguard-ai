import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { IngestView } from './components/dashboard/IngestView';
import { AnalyzeView } from './components/dashboard/AnalyzeView';
import { CommandView } from './components/dashboard/CommandView';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SecurityProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected console */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/console/ingest"  element={<IngestView />} />
                <Route path="/console/analyze" element={<AnalyzeView />} />
                <Route path="/console/command" element={<CommandView />} />
                {/* Fallback — redirect to role entry via ProtectedRoute logic */}
                <Route path="/console" element={<Navigate to="/console/ingest" replace />} />
              </Route>
            </Route>

            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </SecurityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
