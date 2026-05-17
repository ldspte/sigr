import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';

export default function MenuDigital() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [platosRes, categoriasRes] = await Promise.all([
          api.get('/menu/platos'),
          api.get('/menu/categorias')
        ]);
        setPlatos(platosRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('Error al cargar el menú:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const platosFiltrados = filtro === 'Todos' 
    ? platos 
    : platos.filter(p => p.categoria_nombre === filtro);

  if (loading) return <div className="text-center mt-4">Cargando nuestro delicioso menú...</div>;

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="text-center" style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Nuestro Menú
      </h2>
      
      {/* Filtro de Categorías */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <button 
          className={`btn ${filtro === 'Todos' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFiltro('Todos')}
        >
          Todos
        </button>
        {categorias.map(cat => (
          <button 
            key={cat.id} 
            className={`btn ${filtro === cat.nombre ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltro(cat.nombre)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Galería de Platos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {platosFiltrados.map(plato => (
          <div key={plato.id} className="menu-card" style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s'
          }}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-main)' }}>{plato.nombre}</h3>
                <span style={{ 
                  backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                  color: 'var(--primary-color)', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  ${plato.precio}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '60px', lineHeight: '1.5' }}>
                {plato.descripcion || 'Una delicia de nuestra cocina preparada con los mejores ingredientes.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                  {plato.categoria_nombre}
                </small>
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '6px',
                  fontWeight: '600',
                  backgroundColor: plato.estado === 'disponible' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: plato.estado === 'disponible' ? 'var(--success)' : 'var(--danger)'
                }}>
                  {plato.estado.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {platosFiltrados.length === 0 && (
        <p className="text-center" style={{ color: 'var(--text-muted)', marginTop: '3rem', fontSize: '1.1rem' }}>
          No hay platos en esta categoría en este momento.
        </p>
      )}
    </div>
  );
}
