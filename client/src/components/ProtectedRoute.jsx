import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
            <Shield className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes
  return <Outlet />;
}
