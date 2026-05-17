import { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StaffReservas() {
  const [reservas, setReservas] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Protección de ruta: Solo meseros o admins
    if (!user || (user.rol !== 'mesero' && user.rol !== 'administrador')) {
      navigate('/');
      return;
    }
    cargarReservas();
  }, [user]);

  const cargarReservas = async () => {
    try {
      const res = await api.get('/reservas');
      setReservas(res.data);
    } catch (error) {
      console.error('Error al cargar reservas', error);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/reservas/${id}/estado`, { estado: nuevoEstado });
      cargarReservas();
    } catch (error) {
      alert('Error al actualizar reserva');
    }
  };

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '0 0 2rem 0' }}>Gestión de Reservas</h2>

      <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Control de Mesas</h3>
        {reservas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay reservas registradas en el sistema.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 0' }}>ID</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(reserva => {
                const fecha = new Date(reserva.fecha_hora);
                return (
                  <tr key={reserva.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>#{reserva.id}</td>
                    <td style={{ color: 'var(--text-main)' }}>{reserva.cliente || 'Usuario Desconocido'}</td>
                    <td>{fecha.toLocaleString()}</td>
                    <td>{reserva.numero_mesa ? `Mesa ${reserva.numero_mesa}` : 'Cualquiera'}</td>
                    <td>
                      <span style={{ 
                        backgroundColor: reserva.estado === 'confirmada' ? 'rgba(34, 197, 94, 0.1)' : reserva.estado === 'cancelada' ? 'rgba(239, 68, 68, 0.1)' : reserva.estado === 'completada' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                        color: reserva.estado === 'confirmada' ? 'var(--success)' : reserva.estado === 'cancelada' ? 'var(--danger)' : reserva.estado === 'completada' ? '#3b82f6' : 'var(--primary-color)',
                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem'
                      }}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td>
                      {reserva.estado === 'pendiente' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => cambiarEstado(reserva.id, 'confirmada')}>Confirmar</button>
                          <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => cambiarEstado(reserva.id, 'cancelada')}>Cancelar</button>
                        </div>
                      )}
                      {reserva.estado === 'confirmada' && (
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => cambiarEstado(reserva.id, 'completada')}>Marcar Asistencia (Completada)</button>
                      )}
                      {(reserva.estado === 'cancelada' || reserva.estado === 'completada') && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin acciones</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
