import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-brand">Pipeline</span>
          <span className="text-xs uppercase tracking-wide text-ink-300">CRM</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-ink-500">
              Signed in as <span className="font-medium text-ink-700">{user?.name}</span>
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
