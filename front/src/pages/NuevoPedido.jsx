import { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NuevoPedido() {
  const [platos, setPlatos] = useState([]);
  const [mesaId, setMesaId] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    cargarPlatos();
  }, [user]);

  const cargarPlatos = async () => {
    try {
      const res = await api.get('/menu/platos');
      setPlatos(res.data.filter(p => p.estado === 'disponible'));
    } catch (error) {
      console.error('Error al cargar platos', error);
    }
  };

  const agregarAlCarrito = (plato) => {
    const existe = carrito.find(item => item.plato_id === plato.id);
    if (existe) {
      setCarrito(carrito.map(item => item.plato_id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { plato_id: plato.id, nombre: plato.nombre, precio_unitario: Number(plato.precio), cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (platoId) => {
    setCarrito(carrito.filter(item => item.plato_id !== platoId));
  };

  const enviarPedido = async () => {
    if (carrito.length === 0) return setError('Debes agregar al menos un plato al pedido');
    if (!mesaId) return setError('El número de mesa es obligatorio');

    try {
      await api.post('/pedidos', {
        mesa_id: parseInt(mesaId),
        detalles: carrito
      });
      // Si es staff, lo mandamos al dashboard. Si es cliente, al menú.
      if (user.rol === 'administrador' || user.rol === 'mesero') {
        navigate('/dashboard'); 
      } else {
        alert('¡Tu pedido ha sido enviado a la cocina!');
        navigate('/menu');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el pedido. Verifica los datos.');
    }
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '2.5rem' }}>Registro de Nuevo Pedido</h2>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 350px', gap: '3rem' }}>
        
        {/* Menú Interactivo (Click para agregar) */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Selecciona los Platos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {platos.map(plato => (
              <div 
                key={plato.id} 
                className="auth-card menu-card" 
                style={{ padding: '1.2rem', cursor: 'pointer', maxWidth: '100%', margin: 0 }} 
                onClick={() => agregarAlCarrito(plato)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{plato.nombre}</strong>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>${plato.precio}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    + Click para añadir
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral: Resumen del Pedido */}
        <div className="auth-card" style={{ height: 'fit-content', padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', fontSize: '1.4rem' }}>La Comanda</h3>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Asignar a Mesa Nº</label>
            <input type="number" className="form-input" value={mesaId} onChange={(e) => setMesaId(e.target.value)} min="1" placeholder="Ej: 1" required />
          </div>

          <div style={{ minHeight: '150px' }}>
            {carrito.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'center', marginTop: '2rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🍽️</span>
                El pedido está vacío. Toca un plato a la izquierda para agregarlo.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {carrito.map(item => (
                  <li key={item.plato_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>{item.nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.cantidad} x ${item.precio_unitario}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 'bold' }}>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                      <button style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => quitarDelCarrito(item.plato_id)} title="Remover">
                        ✖
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', margin: '2rem 0', borderTop: '2px solid var(--border-color)', paddingTop: '1rem' }}>
            <span>Total a Pagar:</span>
            <span style={{ color: 'var(--primary-color)' }}>${total.toFixed(2)}</span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={enviarPedido}>
            Enviar Pedido a Cocina
          </button>
        </div>
      </div>
    </div>
  );
}
