import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        🔥 SIGR
      </Link>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/menu" className="nav-link">Menú</Link>
        <Link to="/reservas" className="nav-link">Reservas</Link>
        {user && (user.rol === 'mesero' || user.rol === 'administrador') && (
          <>
            <Link to="/staff-reservas" className="nav-link" style={{ color: 'var(--primary-color)' }}>Gestión Reservas</Link>
            <Link to="/dashboard" className="nav-link" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Dashboard Staff</Link>
          </>
        )}
        {user && user.rol === 'administrador' && (
          <Link to="/admin-menu" className="nav-link" style={{ color: 'var(--success)', fontWeight: 'bold' }}>Gestión Menú</Link>
        )}
        {user ? (
          <div className="nav-user">
            <span style={{ color: 'var(--text-muted)' }}>Hola, {user.nombre}</span>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
              Salir
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', width: 'auto' }}>
              Regístrate
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
