import { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [reporte, setReporte] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no es staff, redirigir
    if (!user || (user.rol !== 'mesero' && user.rol !== 'administrador')) {
      navigate('/');
      return;
    }
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    try {
      const pedidosRes = await api.get('/pedidos');
      setPedidos(pedidosRes.data);
      
      if (user?.rol === 'administrador') {
        const reporteRes = await api.get('/facturacion/reporte');
        setReporte(reporteRes.data);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const generarFactura = async (pedidoId) => {
    if (!window.confirm('¿Seguro que deseas cobrar y facturar este pedido?')) return;
    try {
      await api.post('/facturacion/generar', { pedido_id: pedidoId });
      alert('Factura generada exitosamente. El pedido ha sido pagado.');
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al generar factura');
    }
  };

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: 0 }}>Portal del Staff</h2>
        <button className="btn btn-primary" onClick={() => navigate('/nuevo-pedido')}>
          + Tomar Nuevo Pedido
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: user?.rol === 'administrador' ? '2fr 1fr' : '1fr', gap: '2rem' }}>
        
        {/* Lista de Pedidos */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', fontSize: '1.4rem' }}>Gestión de Pedidos</h3>
          
          {pedidos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No hay pedidos registrados en el sistema.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {pedidos.map(pedido => (
                <div key={pedido.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  padding: '1.5rem', 
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                      Pedido #{pedido.id} - Mesa {pedido.numero_mesa || 'N/A'}
                    </strong>
                    <span style={{ 
                      backgroundColor: pedido.estado === 'pagado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                      color: pedido.estado === 'pagado' ? 'var(--success)' : 'var(--primary-color)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '1px'
                    }}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Monto Total: <strong style={{ color: 'var(--text-main)' }}>${pedido.total}</strong> | Registrado por: {pedido.mesero || pedido.cliente || 'Sistema'}
                  </p>
                  
                  {pedido.estado !== 'pagado' && (
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      {pedido.estado === 'pendiente' && (
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => actualizarEstado(pedido.id, 'en_preparacion')}>Pasar a Preparación</button>
                      )}
                      {pedido.estado === 'en_preparacion' && (
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => actualizarEstado(pedido.id, 'listo')}>Marcar como Listo</button>
                      )}
                      {pedido.estado === 'listo' && (
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => actualizarEstado(pedido.id, 'servido')}>Marcar Servido</button>
                      )}
                      {pedido.estado === 'servido' && (
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => generarFactura(pedido.id)}>Cobrar y Generar Factura</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reporte (Solo visible para el Administrador) */}
        {user?.rol === 'administrador' && (
          <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', fontSize: '1.4rem' }}>Cierre de Caja</h3>
            {reporte.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay facturación registrada todavía.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {reporte.map((dia, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem', 
                    fontSize: '1rem',
                    padding: '0.8rem',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{dia.fecha.split('T')[0]}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{dia.total_ventas} ventas procesadas</small>
                    </div>
                    <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>${dia.ingresos}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
