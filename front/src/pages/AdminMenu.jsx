import { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminMenu() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para los modales
  const [showPlatoModal, setShowPlatoModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  // Estados para los formularios
  const [nuevaCat, setNuevaCat] = useState('');
  const [nuevoPlato, setNuevoPlato] = useState({ nombre: '', descripcion: '', precio: '', categoria_id: '' });

  useEffect(() => {
    // Solo permitimos el acceso a administradores
    if (!user || user.rol !== 'administrador') {
      navigate('/');
      return;
    }
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    try {
      const [platosRes, categoriasRes] = await Promise.all([
        api.get('/menu/platos'),
        api.get('/menu/categorias')
      ]);
      setPlatos(platosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/categorias', { nombre: nuevaCat, descripcion: '' });
      setNuevaCat('');
      setShowCatModal(false);
      cargarDatos();
    } catch (error) {
      alert('Error al crear categoría');
    }
  };

  const handleCrearPlato = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/platos', {
        ...nuevoPlato,
        precio: parseFloat(nuevoPlato.precio),
        categoria_id: parseInt(nuevoPlato.categoria_id)
      });
      setNuevoPlato({ nombre: '', descripcion: '', precio: '', categoria_id: '' });
      setShowPlatoModal(false);
      cargarDatos();
    } catch (error) {
      alert('Error al crear plato');
    }
  };

  const toggleEstadoPlato = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'disponible' ? 'agotado' : 'disponible';
    try {
      await api.patch(`/menu/platos/${id}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const eliminarPlato = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este plato de forma permanente?')) return;
    try {
      await api.delete(`/menu/platos/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar plato');
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría? Asegúrate de que no tenga platos asignados.')) return;
    try {
      await api.delete(`/menu/categorias/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar categoría. Verifica que no tenga platos vinculados.');
    }
  };

  // Estilos simples para modales superpuestos
  const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    backdropFilter: 'blur(5px)'
  };

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: 0 }}>Gestión de Menú</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setShowCatModal(true)}>+ Nueva Categoría</button>
          <button className="btn btn-primary" onClick={() => setShowPlatoModal(true)}>+ Nuevo Plato</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', alignItems: 'start' }}>
        {/* Tabla de Categorías */}
        <div className="auth-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Categorías</h3>
          {categorias.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay categorías.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {categorias.map(cat => (
                <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>{cat.nombre}</span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => eliminarCategoria(cat.id)} title="Eliminar Categoría">🗑️</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabla de Platos */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Inventario de Platos</h3>
          
          {platos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay platos registrados. Empieza creando una categoría y luego un plato.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 0' }}>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platos.map(plato => (
                  <tr key={plato.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{plato.nombre}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{plato.categoria_nombre}</td>
                    <td style={{ color: 'var(--success)' }}>${plato.precio}</td>
                    <td>
                      <span style={{ 
                        backgroundColor: plato.estado === 'disponible' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: plato.estado === 'disponible' ? 'var(--success)' : 'var(--danger)',
                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem'
                      }}>
                        {plato.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} 
                          onClick={() => toggleEstadoPlato(plato.id, plato.estado)}
                        >
                          Toggle {plato.estado === 'disponible' ? 'Agotado' : 'Disponible'}
                        </button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.4rem' }} onClick={() => eliminarPlato(plato.id)} title="Eliminar Plato">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Nueva Categoría */}
      {showCatModal && (
        <div style={modalStyle}>
          <div className="auth-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Añadir Categoría</h3>
            <form onSubmit={handleCrearCategoria}>
              <div className="form-group">
                <label className="form-label">Nombre de Categoría</label>
                <input type="text" className="form-input" placeholder="Ej: Bebidas, Postres..." value={nuevaCat} onChange={e => setNuevaCat(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowCatModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Plato */}
      {showPlatoModal && (
        <div style={modalStyle}>
          <div className="auth-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Registrar Nuevo Plato</h3>
            <form onSubmit={handleCrearPlato}>
              <div className="form-group">
                <label className="form-label">Nombre del Plato</label>
                <input type="text" className="form-input" value={nuevoPlato.nombre} onChange={e => setNuevoPlato({...nuevoPlato, nombre: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows="2" value={nuevoPlato.descripcion} onChange={e => setNuevoPlato({...nuevoPlato, descripcion: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio ($)</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={nuevoPlato.precio} onChange={e => setNuevoPlato({...nuevoPlato, precio: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={nuevoPlato.categoria_id} onChange={e => setNuevoPlato({...nuevoPlato, categoria_id: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowPlatoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Crear Plato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
