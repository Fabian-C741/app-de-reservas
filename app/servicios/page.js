'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Las categorías ahora se generarán automáticamente basadas en la base de datos

const FALLBACK_SERVICIOS = [
  { id: '1', nombre: 'Corte y Peinado', descripcion: 'Corte personalizado según tu estilo con lavado y secado profesional.', duracion_minutos: 60, precio: 3500, categoria: 'Cabello', icon: '💇‍♀️' },
  { id: '2', nombre: 'Coloración Completa', descripcion: 'Tintura de cabello con productos premium sin amoníaco.', duracion_minutos: 120, precio: 8500, categoria: 'Cabello', icon: '🎨' },
  { id: '3', nombre: 'Mechas y Balayage', descripcion: 'Técnicas de iluminación y degradado para un look natural y luminoso.', duracion_minutos: 150, precio: 12000, categoria: 'Cabello', icon: '✨' },
  { id: '4', nombre: 'Tratamiento Keratina', descripcion: 'Alisado y nutrición profunda del cabello con resultados duraderos.', duracion_minutos: 180, precio: 15000, categoria: 'Tratamientos', icon: '🌿' },
  { id: '5', nombre: 'Manicura Premium', descripcion: 'Cuidado completo de manos con esmaltes semipermanentes de larga duración.', duracion_minutos: 60, precio: 2500, categoria: 'Uñas', icon: '💅' },
  { id: '6', nombre: 'Pedicura Spa', descripcion: 'Relajante tratamiento de pies con scrub, masaje y esmalte.', duracion_minutos: 75, precio: 3000, categoria: 'Uñas', icon: '🦶' },
  { id: '7', nombre: 'Facial Hidratante', descripcion: 'Limpieza profunda e hidratación intensiva con productos naturales.', duracion_minutos: 60, precio: 4500, categoria: 'Facial', icon: '🌸' },
  { id: '8', nombre: 'Maquillaje Social', descripcion: 'Maquillaje profesional para eventos y ocasiones especiales.', duracion_minutos: 60, precio: 5500, categoria: 'Maquillaje', icon: '💄' },
];

function formatPrice(p) {
  return '$' + Number(p).toLocaleString('es-AR');
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState(FALLBACK_SERVICIOS);
  const [categorias, setCategorias] = useState(['Todas']);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServicios() {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('categoria');
      if (data && data.length > 0) {
        // Add icons based on category
        const iconMap = { Cabello: '💇‍♀️', Tratamientos: '🌿', 'Uñas': '💅', Facial: '🌸', Maquillaje: '💄', Masajes: '💆‍♀️', Pestañas: '👁️', Cejas: '✨', Depilación: '🦵', Spa: '🛁', Corporales: '🧘‍♀️', Barbería: '💈', Hombre: '💈' };
        setServicios(data.map(s => ({ ...s, icon: iconMap[s.categoria] || '✨' })));
        
        // Dynamically get unique categories
        const uniqueCats = ['Todas', ...new Set(data.map(s => s.categoria).filter(Boolean))];
        setCategorias(uniqueCats);
      }
      setLoading(false);
    }
    fetchServicios();
  }, []);

  const filtrados = categoriaActiva === 'Todas'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaActiva);

  return (
    <>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--blush) 100%)',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <span className="badge badge-rose" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            Nuestros servicios
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--charcoal)', marginBottom: '1rem' }}>
            Tratamientos para tu{' '}
            <span className="gradient-text">bienestar</span>
          </h1>
          <div className="divider" />
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
            Elegí el servicio que más se ajusta a lo que necesitás y reservá tu turno al instante.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0', paddingTop: '0' }}>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: categoriaActiva === cat ? '2px solid var(--rose)' : '2px solid transparent',
                  color: categoriaActiva === cat ? 'var(--rose)' : 'var(--muted)',
                  fontWeight: categoriaActiva === cat ? 600 : 400,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
              <p style={{ marginTop: '1rem' }}>Cargando servicios...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}>
              {filtrados.map(s => (
                <div key={s.id} className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Card top color bar */}
                  <div style={{
                    height: 6,
                    background: 'linear-gradient(90deg, var(--rose), var(--gold))',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  }} />
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span style={{
                        width: 52, height: 52,
                        background: 'var(--blush)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}>{s.icon}</span>
                      <span className="badge badge-rose">{s.categoria}</span>
                    </div>

                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.2rem',
                      color: 'var(--charcoal)',
                      marginBottom: '0.625rem',
                    }}>{s.nombre}</h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, flex: 1 }}>
                      {s.descripcion}
                    </p>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '1.25rem', paddingTop: '1.25rem',
                      borderTop: '1px solid var(--border)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--rose)', fontSize: '1.25rem' }}>
                          {formatPrice(s.precio)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
                          ⏱ {s.duracion_minutos} min
                        </div>
                      </div>
                      <Link
                        href={`/reservar?servicio=${s.id}`}
                        className="btn-primary"
                        style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                      >
                        Reservar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
