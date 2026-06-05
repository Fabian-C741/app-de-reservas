'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const ESTADOS = ['todas', 'pendiente', 'confirmada', 'cancelada'];

const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: 'badge-gold',  dot: '#C9A84C' },
  confirmada: { label: 'Confirmada', color: 'badge-green', dot: '#2E7D32' },
  cancelada:  { label: 'Cancelada',  color: 'badge-red',   dot: '#C62828' },
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [updating, setUpdating] = useState(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setCheckingAuth(false);
        fetchReservas();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchReservas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        servicios ( nombre, precio )
      `)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (!error && data) setReservas(data);
    setLoading(false);
  }

  async function cambiarEstado(id, nuevoEstado) {
    setUpdating(id);
    const { error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    }
    setUpdating(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Filters
  const reservasFiltradas = reservas.filter(r => {
    if (filtroEstado !== 'todas' && r.estado !== filtroEstado) return false;
    if (filtroFecha && r.fecha !== filtroFecha) return false;
    if (busqueda && !r.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase()) &&
        !r.telefono.includes(busqueda)) return false;
    return true;
  });

  // Stats
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    hoy: reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length,
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Admin Header */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--rose), var(--rose-dark))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1rem',
          }}>⚙</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.125rem', color: 'var(--charcoal)', margin: 0 }}>
              Panel de administración
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
              {user?.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/" className="btn-ghost" style={{ fontSize: '0.875rem' }}>
            ← Ver sitio
          </Link>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', padding: '0 1.5rem', minWidth: 'max-content' }}>
          <Link href="/admin" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Reservas</Link>
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Configuración Web</Link>
          <Link href="/admin/ventajas" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ventajas</Link>
          <Link href="/admin/testimonios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Testimonios</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total reservas', value: stats.total, icon: '📋', color: 'var(--rose)' },
            { label: 'Pendientes', value: stats.pendientes, icon: '⏳', color: '#C9A84C' },
            { label: 'Confirmadas', value: stats.confirmadas, icon: '✅', color: '#2E7D32' },
            { label: 'Hoy', value: stats.hoy, icon: '📅', color: '#1565C0' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: 200, padding: '0.625rem 1rem' }}
            />
            <input
              type="date"
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '0.625rem 1rem', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {ESTADOS.map(estado => (
                <button key={estado} onClick={() => setFiltroEstado(estado)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${filtroEstado === estado ? 'var(--rose)' : 'var(--border)'}`,
                    background: filtroEstado === estado ? 'var(--rose)' : 'transparent',
                    color: filtroEstado === estado ? '#fff' : 'var(--muted)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}>
                  {estado === 'todas' ? 'Todas' : estado}
                </button>
              ))}
            </div>
            {filtroFecha && (
              <button onClick={() => setFiltroFecha('')} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                Limpiar fecha
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.125rem', color: 'var(--charcoal)', margin: 0 }}>
              Reservas {filtroEstado !== 'todas' ? `— ${filtroEstado}` : ''}
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', fontWeight: 400, color: 'var(--muted)' }}>
                ({reservasFiltradas.length} resultados)
              </span>
            </h2>
            <button onClick={fetchReservas} className="btn-ghost" style={{ fontSize: '0.8rem' }} title="Actualizar">
              🔄 Actualizar
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: 32, height: 32, borderWidth: 3, borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
              Cargando reservas...
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📭</span>
              No hay reservas con los filtros seleccionados.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Cliente', 'Contacto', 'Servicio', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 1rem', textAlign: 'left',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((r, i) => {
                    const cfg = ESTADO_CONFIG[r.estado] || ESTADO_CONFIG.pendiente;
                    return (
                      <tr key={r.id} style={{
                        borderBottom: '1px solid var(--border)',
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--cream)',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--blush)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface)' : 'var(--cream)'}
                      >
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--charcoal)' }}>
                          {r.nombre_cliente}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--muted)' }}>
                          <div>{r.telefono}</div>
                          {r.email && <div style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>{r.email}</div>}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)' }}>
                          {r.servicios?.nombre || '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                          {formatDate(r.fecha)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                          {r.hora ? r.hora.slice(0, 5) + ' hs' : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <select
                            value={r.estado}
                            disabled={updating === r.id}
                            onChange={e => cambiarEstado(r.id, e.target.value)}
                            style={{
                              padding: '0.375rem 0.625rem',
                              border: '1.5px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              color: 'var(--charcoal)',
                              background: 'var(--surface)',
                              cursor: 'pointer',
                              opacity: updating === r.id ? 0.5 : 1,
                            }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
