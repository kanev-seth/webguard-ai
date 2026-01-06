import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import AppLayout from "./components/layout/AppLayout"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
              <Route path="/alerts" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
export default App
