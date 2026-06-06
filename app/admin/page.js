'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const ESTADOS = ['todas', 'pendiente', 'confirmada', 'cancelada'];

const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: 'badge-gold',  dot: '#C9A84C', bg: '#FFFDE7' },
  confirmada: { label: 'Confirmada', color: 'badge-green', dot: '#2E7D32', bg: '#E8F5E9' },
  cancelada:  { label: 'Cancelada',  color: 'badge-red',   dot: '#C62828', bg: '#FFEBEE' },
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getToday() { return new Date().toISOString().split('T')[0]; }
function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function whatsappUrl(telefono, nombre) {
  const num = telefono.replace(/\D/g, '');
  const msg = encodeURIComponent(`Hola ${nombre}! Te contactamos para confirmar tu turno. 💆‍♀️`);
  return `https://wa.me/${num}?text=${msg}`;
}

function ReservaCard({ r, onCambiarEstado, updating }) {
  const cfg = ESTADO_CONFIG[r.estado] || ESTADO_CONFIG.pendiente;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Hora */}
      <div style={{
        minWidth: 64, textAlign: 'center',
        background: 'linear-gradient(135deg, var(--rose), var(--rose-dark))',
        borderRadius: '10px', padding: '0.5rem 0.75rem', color: '#fff',
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }}>
          {r.hora ? r.hora.slice(0, 5) : '--'}
        </div>
        <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: 2 }}>hs</div>
      </div>

      {/* Info cliente */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 600, color: 'var(--charcoal)', fontSize: '0.9375rem' }}>{r.nombre_cliente}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
          {r.servicios?.nombre || '—'}
        </div>
      </div>

      {/* Estado badge */}
      <span className={`badge ${cfg.color}`} style={{ whiteSpace: 'nowrap' }}>{cfg.label}</span>

      {/* Teléfono */}
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
        📞 {r.telefono}
      </div>

      {/* WhatsApp button */}
      <a
        href={whatsappUrl(r.telefono, r.nombre_cliente)}
        target="_blank"
        rel="noopener noreferrer"
        title={`WhatsApp a ${r.nombre_cliente}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem 0.875rem',
          background: '#25D366',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background 0.2s, transform 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#128C7E'; e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L0 24l6.318-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.535-5.354-1.464L2 22l1.487-4.567A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        WhatsApp
      </a>

      {/* Change state */}
      <select
        value={r.estado}
        disabled={updating === r.id}
        onChange={e => onCambiarEstado(r.id, e.target.value)}
        style={{
          padding: '0.425rem 0.625rem',
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
    </div>
  );
}

function Seccion({ titulo, emoji, color, reservas, onCambiarEstado, updating, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (reservas.length === 0) return null;
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.75rem 0', marginBottom: open ? '0.75rem' : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{emoji}</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--charcoal)', fontWeight: 600 }}>
            {titulo}
          </span>
          <span style={{
            background: color, color: '#fff', borderRadius: 'var(--radius-full)',
            padding: '0.15rem 0.625rem', fontSize: '0.75rem', fontWeight: 700,
          }}>{reservas.length}</span>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {reservas.map(r => (
            <ReservaCard key={r.id} r={r} onCambiarEstado={onCambiarEstado} updating={updating} />
          ))}
        </div>
      )}
    </div>
  );
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
  const [vista, setVista] = useState('agenda'); // 'agenda' | 'tabla'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); }
      else { setUser(session.user); setCheckingAuth(false); fetchReservas(); }
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
      .select('*, servicios ( nombre, precio )')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    if (!error && data) setReservas(data);
    setLoading(false);
  }

  async function cambiarEstado(id, nuevoEstado) {
    setUpdating(id);
    const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
    if (!error) setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    setUpdating(null);
  }

  const today = getToday();
  const tomorrow = getTomorrow();

  // Filters
  const reservasFiltradas = reservas.filter(r => {
    if (filtroEstado !== 'todas' && r.estado !== filtroEstado) return false;
    if (filtroFecha && r.fecha !== filtroFecha) return false;
    if (busqueda && !r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) &&
        !r.telefono?.includes(busqueda)) return false;
    return true;
  });

  // Agenda groups (no filters applied for agenda view, always show all)
  const reservasActivas = reservas.filter(r => r.estado !== 'cancelada');
  const rHoy = reservasActivas.filter(r => r.fecha === today).sort((a, b) => a.hora > b.hora ? 1 : -1);
  const rManana = reservasActivas.filter(r => r.fecha === tomorrow).sort((a, b) => a.hora > b.hora ? 1 : -1);
  const rProximos = reservasActivas.filter(r => r.fecha > tomorrow).sort((a, b) => a.fecha > b.fecha ? 1 : -1);
  const rPasados = reservas.filter(r => r.fecha < today).sort((a, b) => a.fecha > b.fecha ? -1 : 1);

  // Stats
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    hoy: rHoy.length,
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
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--rose), var(--rose-dark))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>⚙</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.125rem', color: 'var(--charcoal)', margin: 0 }}>Panel de administración</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/" className="btn-ghost" style={{ fontSize: '0.875rem' }}>← Ver sitio</Link>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Cerrar sesión</button>
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
          <Link href="/admin/dias-bloqueados" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>🚫 Días Cerrados</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

        {/* Vista switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: 'var(--charcoal)', margin: 0 }}>
            {vista === 'agenda' ? '🗓 Vista Agenda' : '📋 Vista Tabla'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={fetchReservas} className="btn-ghost" style={{ fontSize: '0.8rem' }}>🔄 Actualizar</button>
            <button
              onClick={() => setVista('agenda')}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1.5px solid', borderColor: vista === 'agenda' ? 'var(--rose)' : 'var(--border)', background: vista === 'agenda' ? 'var(--rose)' : 'transparent', color: vista === 'agenda' ? '#fff' : 'var(--muted)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            >🗓 Agenda</button>
            <button
              onClick={() => setVista('tabla')}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1.5px solid', borderColor: vista === 'tabla' ? 'var(--rose)' : 'var(--border)', background: vista === 'tabla' ? 'var(--rose)' : 'transparent', color: vista === 'tabla' ? '#fff' : 'var(--muted)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            >📋 Tabla</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: 32, height: 32, borderWidth: 3, borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
            Cargando reservas...
          </div>
        ) : vista === 'agenda' ? (
          /* ── VISTA AGENDA ── */
          <div>
            {reservas.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📭</span>
                Todavía no hay reservas registradas.
              </div>
            ) : (
              <>
                <Seccion titulo="Hoy" emoji="☀️" color="var(--rose)" reservas={rHoy} onCambiarEstado={cambiarEstado} updating={updating} defaultOpen={true} />
                <Seccion titulo="Mañana" emoji="🌙" color="#1565C0" reservas={rManana} onCambiarEstado={cambiarEstado} updating={updating} defaultOpen={true} />
                <Seccion titulo="Próximos días" emoji="📅" color="#5C6BC0" reservas={rProximos} onCambiarEstado={cambiarEstado} updating={updating} defaultOpen={true} />
                <Seccion titulo="Anteriores" emoji="📂" color="#757575" reservas={rPasados} onCambiarEstado={cambiarEstado} updating={updating} defaultOpen={false} />
                {rHoy.length === 0 && rManana.length === 0 && rProximos.length === 0 && (
                  <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🎉</span>
                    No hay reservas próximas pendientes. ¡Todo al día!
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* ── VISTA TABLA ── */
          <>
            {/* Filters */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="🔍 Buscar nombre o teléfono..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input-field" style={{ flex: 1, minWidth: 200, padding: '0.625rem 1rem' }} />
                <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="input-field" style={{ width: 'auto', padding: '0.625rem 1rem', cursor: 'pointer' }} />
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {ESTADOS.map(estado => (
                    <button key={estado} onClick={() => setFiltroEstado(estado)}
                      style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${filtroEstado === estado ? 'var(--rose)' : 'var(--border)'}`, background: filtroEstado === estado ? 'var(--rose)' : 'transparent', color: filtroEstado === estado ? '#fff' : 'var(--muted)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                      {estado === 'todas' ? 'Todas' : estado}
                    </button>
                  ))}
                </div>
                {filtroFecha && (<button onClick={() => setFiltroFecha('')} className="btn-ghost" style={{ fontSize: '0.8rem' }}>Limpiar fecha</button>)}
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.125rem', color: 'var(--charcoal)', margin: 0 }}>
                  Reservas {filtroEstado !== 'todas' ? `— ${filtroEstado}` : ''}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', fontWeight: 400, color: 'var(--muted)' }}>
                    ({reservasFiltradas.length} resultados)
                  </span>
                </h2>
              </div>

              {reservasFiltradas.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📭</span>
                  No hay reservas con los filtros seleccionados.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--cream)' }}>
                        {['Cliente', 'Contacto', 'Servicio', 'Fecha', 'Hora', 'Estado', 'WhatsApp', 'Acciones'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reservasFiltradas.map((r, i) => {
                        const cfg = ESTADO_CONFIG[r.estado] || ESTADO_CONFIG.pendiente;
                        return (
                          <tr key={r.id}
                            style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--cream)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--blush)'}
                            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface)' : 'var(--cream)'}
                          >
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--charcoal)' }}>{r.nombre_cliente}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--muted)' }}>
                              <div>{r.telefono}</div>
                              {r.email && <div style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>{r.email}</div>}
                            </td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)' }}>{r.servicios?.nombre || '—'}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{formatDate(r.fecha)}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{r.hora ? r.hora.slice(0, 5) + ' hs' : '—'}</td>
                            <td style={{ padding: '0.875rem 1rem' }}><span className={`badge ${cfg.color}`}>{cfg.label}</span></td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <a href={whatsappUrl(r.telefono, r.nombre_cliente)} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: '#25D366', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L0 24l6.318-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.535-5.354-1.464L2 22l1.487-4.567A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                Escribir
                              </a>
                            </td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <select value={r.estado} disabled={updating === r.id} onChange={e => cambiarEstado(r.id, e.target.value)}
                                style={{ padding: '0.375rem 0.625rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--charcoal)', background: 'var(--surface)', cursor: 'pointer', opacity: updating === r.id ? 0.5 : 1 }}>
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
          </>
        )}
      </div>
    </div>
  );
}
