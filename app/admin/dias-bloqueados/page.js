'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function isDatePast(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export default function DiasBloqueadosPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [dias, setDias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ fecha: '', motivo: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); }
      else { setUser(session.user); setCheckingAuth(false); fetchDias(); }
    });
  }, [router]);

  async function fetchDias() {
    setLoading(true);
    const { data } = await supabase
      .from('dias_bloqueados')
      .select('*')
      .order('fecha', { ascending: true });
    if (data) setDias(data);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.fecha) { setError('Por favor seleccioná una fecha.'); return; }
    setSaving(true);
    setError('');
    setSuccess('');

    const { error: dbError } = await supabase.from('dias_bloqueados').insert([{
      fecha: form.fecha,
      motivo: form.motivo.trim() || 'Día no disponible',
    }]);

    if (dbError) {
      if (dbError.code === '23505') {
        setError('Ese día ya está bloqueado en el sistema.');
      } else {
        setError('No se pudo guardar. Intentá de nuevo.');
      }
    } else {
      setSuccess(`✓ El ${formatDateDisplay(form.fecha)} fue bloqueado correctamente.`);
      setForm({ fecha: '', motivo: '' });
      fetchDias();
    }
    setSaving(false);
  }

  async function handleDelete(id, fecha) {
    if (!confirm(`¿Querés desbloquear el ${formatDateDisplay(fecha)}?`)) return;
    setDeleting(id);
    await supabase.from('dias_bloqueados').delete().eq('id', id);
    setDias(prev => prev.filter(d => d.id !== id));
    setDeleting(null);
  }

  const today = new Date().toISOString().split('T')[0];
  const diasFuturos = dias.filter(d => !isDatePast(d.fecha));
  const diasPasados = dias.filter(d => isDatePast(d.fecha));

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
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
          <Link href="/admin" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Reservas</Link>
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Configuración Web</Link>
          <Link href="/admin/ventajas" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ventajas</Link>
          <Link href="/admin/testimonios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Testimonios</Link>
          <Link href="/admin/dias-bloqueados" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>🚫 Días Cerrados</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 760 }}>

        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF3F6 0%, #FFF9F0 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🏖️</span>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: 'var(--charcoal)', margin: '0 0 0.25rem' }}>Días Cerrados</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
              Bloqueá días por vacaciones, reposo médico, feriados o cualquier motivo. Las clientas no podrán reservar en esas fechas y verán un aviso.
            </p>
          </div>
        </div>

        {/* Add form */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--charcoal)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ➕ Bloquear un día
          </h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.375rem' }}>Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  min={today}
                  onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.375rem' }}>Motivo (opcional)</label>
                <input
                  type="text"
                  value={form.motivo}
                  onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: Reposo médico, Vacaciones, Feriado..."
                  className="input-field"
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 'var(--radius-sm)', color: '#C62828', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '0.75rem 1rem', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: 'var(--radius-sm)', color: '#2E7D32', fontSize: '0.875rem' }}>
                {success}
              </div>
            )}

            <div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
                {saving ? <><div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 16, height: 16, borderWidth: 2, display: 'inline-block', marginRight: 8 }} />Guardando...</> : '🚫 Bloquear este día'}
              </button>
            </div>
          </form>
        </div>

        {/* Future blocked days */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--charcoal)', margin: 0 }}>
              Próximos días bloqueados
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', fontWeight: 400, color: 'var(--muted)' }}>
                ({diasFuturos.length})
              </span>
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
              <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--rose)', borderColor: 'var(--border)' }} />
            </div>
          ) : diasFuturos.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
              <p style={{ margin: 0 }}>No hay días bloqueados próximamente. Tu agenda está abierta.</p>
            </div>
          ) : (
            <div>
              {diasFuturos.map((d, i) => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: i < diasFuturos.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'var(--surface)' : 'var(--cream)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 44, height: 44,
                      background: 'linear-gradient(135deg, #FFEBEE, #FCE4EC)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}>🚫</div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--charcoal)', fontSize: '0.9375rem', textTransform: 'capitalize' }}>
                        {formatDateDisplay(d.fecha)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
                        {d.motivo || 'Sin motivo especificado'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id, d.fecha)}
                    disabled={deleting === d.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid #FFCDD2',
                      background: 'transparent',
                      color: '#C62828',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFEBEE'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {deleting === d.id ? '...' : '🗑 Desbloquear'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past blocked days (collapsed) */}
        {diasPasados.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <details>
              <summary style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 0', userSelect: 'none' }}>
                Ver días pasados ({diasPasados.length})
              </summary>
              <div className="card" style={{ marginTop: '0.75rem', overflow: 'hidden' }}>
                {diasPasados.reverse().map((d, i) => (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1.5rem',
                    borderBottom: i < diasPasados.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: 0.65,
                  }}>
                    <span style={{ fontSize: '1rem' }}>📅</span>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--charcoal)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        {formatDateDisplay(d.fecha)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{d.motivo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}
