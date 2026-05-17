import { useState } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Reservas() {
  const [fecha_hora, setFechaHora] = useState('');
  const [mesa_id, setMesaId] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <h2 className="auth-title">¡Únete para reservar!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Necesitas iniciar sesión para poder asegurar tu lugar en nuestro restaurante.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Ir a Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservas', {
        fecha_hora: fecha_hora.replace('T', ' ') + ':00', // Formato MySQL YYYY-MM-DD HH:MM:SS
        mesa_id: mesa_id ? parseInt(mesa_id) : null 
      });
      setMensaje({ texto: '¡Reserva creada con éxito! Te esperamos.', tipo: 'success' });
      setFechaHora('');
      setMesaId('');
    } catch (error) {
      setMensaje({ 
        texto: error.response?.data?.message || 'Error al procesar la reserva. Verifica los datos.', 
        tipo: 'error' 
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">Haz tu Reserva</h2>
        <p className="text-center" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Asegura tu lugar en la mejor experiencia gastronómica de la ciudad.
        </p>

        {mensaje.texto && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: '6px', 
            textAlign: 'center',
            backgroundColor: mensaje.tipo === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: mensaje.tipo === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${mensaje.tipo === 'success' ? 'var(--success)' : 'var(--danger)'}`
          }}>
            {mensaje.texto}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Fecha y Hora</label>
            <input 
              type="datetime-local" 
              className="form-input" 
              value={fecha_hora}
              onChange={(e) => setFechaHora(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Número de Mesa Preferida (Opcional)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Ej: 1"
              min="1"
              value={mesa_id}
              onChange={(e) => setMesaId(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Confirmar Reserva
          </button>
        </form>
      </div>
    </div>
  );
}
