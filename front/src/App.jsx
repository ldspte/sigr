import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import MenuDigital from './pages/MenuDigital';
import Reservas from './pages/Reservas';
import StaffDashboard from './pages/StaffDashboard';
import NuevoPedido from './pages/NuevoPedido';
import AdminMenu from './pages/AdminMenu';
import StaffReservas from './pages/StaffReservas';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Bienvenido a <span className="text-primary">SIGR</span></h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
        La experiencia gastronómica del futuro. Gestiona pedidos, visualiza nuestro menú digital y realiza reservas al instante.
      </p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuDigital />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<StaffDashboard />} />
          <Route path="/nuevo-pedido" element={<NuevoPedido />} />
          <Route path="/admin-menu" element={<AdminMenu />} />
          <Route path="/staff-reservas" element={<StaffReservas />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
