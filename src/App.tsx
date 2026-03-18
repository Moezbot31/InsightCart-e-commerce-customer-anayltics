/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { SegmentDetail } from './components/SegmentDetail';
import { RawData } from './components/RawData';
import { PipelineProvider } from './context/PipelineContext';

const AppRoutes = () => {
  const { user, loading, isAnalyst } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Initializing InsightCart...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/segment/:segmentId" element={<SegmentDetail />} />
          <Route path="/raw-data" element={<RawData />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PipelineProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PipelineProvider>
    </AuthProvider>
  );
}

