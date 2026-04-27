import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scan from './pages/Scan';
import History from './pages/History';
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
              <Route path="/scan" element={<Scan setLatestScan={setLatestScan} />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Routes>
        </main>
        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} ScamShield — Protecting you from online threats.
        </footer>
        <Chatbot context={latestScan} />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}
