import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scan from './pages/Scan';
import History from './pages/History';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [latestScan, setLatestScan] = useState(null);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col relative">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<Scan setLatestScan={setLatestScan} />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </main>
        {/* Premium Minimalist Typographic Footer */}
        <footer className="w-full bg-[var(--color-abyss)] border-t border-[var(--color-charcoal)] pt-24 overflow-hidden mt-20">
          <div className="w-full flex justify-between items-center px-6 sm:px-12 mb-16">
            {/* Left spacing spacer to perfectly center the middle text */}
            <div className="flex-1 hidden sm:block"></div>
            
            <h2 className="flex-1 text-center font-display text-2xl sm:text-[32px] font-normal tracking-[-1px] text-[var(--color-snow)] leading-tight">
              The ultimate <span className="text-[var(--color-signal)] drop-shadow-[0_0_8px_rgba(0,217,146,0.3)]">threat</span> <br className="hidden sm:block" /><span className="text-[var(--color-signal)] drop-shadow-[0_0_8px_rgba(0,217,146,0.3)]">detection</span> agent.
            </h2>
            
            <div className="flex-1 flex justify-end">
              <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full border-[3px] border-[var(--color-signal)] text-[var(--color-signal)] flex-shrink-0 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,217,146,0.5)]">
                <span className="font-display font-bold text-2xl sm:text-3xl">C</span>
              </div>
            </div>
          </div>
          
          {/* Half-cut massive text at the absolute bottom */}
          <div className="w-full h-[11vw] relative">
            <div className="absolute top-0 w-full text-center text-[var(--color-signal)] opacity-20 font-display font-bold select-none tracking-tighter transition-all duration-1000 hover:opacity-100" style={{ fontSize: '15vw', lineHeight: '0.85' }}>
              SCAMSHIELD
            </div>
          </div>
        </footer>
        <Chatbot context={latestScan} />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}
