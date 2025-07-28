import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ViolationFormPage from './pages/ViolationFormPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/demo" replace />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/:hoaId" element={<HomePage />} />
          <Route path="/:hoaId/submit" element={<ViolationFormPage />} />
          <Route path="/:hoaId/admin" element={<AdminLoginPage />} />
          <Route 
            path="/:hoaId/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
