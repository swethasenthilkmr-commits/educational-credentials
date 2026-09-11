import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NetworkBanner } from './components/NetworkBanner';

import { HomePage } from './pages/HomePage';
import { IssuerDashboard } from './pages/IssuerDashboard';
import { IssueCredentialPage } from './pages/IssueCredentialPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { VerifierPortal } from './pages/VerifierPortal';
import { AboutPage } from './pages/AboutPage';

export function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-edu-100 selection:text-edu-900">
          <NetworkBanner />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/issuer" element={<IssuerDashboard />} />
              <Route path="/issuer/issue" element={<IssueCredentialPage />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/verify" element={<VerifierPortal />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
