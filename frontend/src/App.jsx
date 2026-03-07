import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NgoDashboard from './pages/NGODashboard';
import NgoOnboarding from './components/onboarding/NgoOnboarding';
import DonorOnboarding from './pages/donors/DonorOnboarding';
import DonorExplore from './pages/donors/DonorExplore';
import DonorDashboard from './pages/donors/DonorDashboard';
import TransparencyLedger from './pages/TransparencyLedger';
import ImpactFeed from './pages/ImpactFeed';
import ProjectDetails from './pages/ProjectDetails';
import NgoDetails from './pages/NgoDetails';
import ImpactStoryDetails from './pages/ImpactStoryDetails';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-orange-100/50 via-slate-50 to-slate-50 flex flex-col pt-20 font-sans">
        <Navbar />
        <div className="flex-1 w-full pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<NgoOnboarding />} />
            <Route path="/donor-onboarding" element={<DonorOnboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ledger" element={<TransparencyLedger />} />
            <Route path="/impact-stories" element={<ImpactFeed />} />
            <Route path="/impact/:id" element={<ImpactStoryDetails />} />
            <Route
              path="/explore"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorExplore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ngo/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <NgoDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:type/:id"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/project/:type/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
