'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function VentajasPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [ventajas, setVentajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ icono: '', titulo: '', descripcion: '', activo: true });

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setCheckingAuth(false); fetchVentajas(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push('/login'); else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchVentajas() {
    setLoading(true);
    const { data } = await supabase.from('ventajas').select('*').order('id', { ascending: true });
    if (data) setVentajas(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function handleEdit(v) {
    setEditingId(v.id);
    setForm({ icono: v.icono, titulo: v.titulo, descripcion: v.descripcion, activo: v.activo });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ icono: '', titulo: '', descripcion: '', activo: true });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };

    if (editingId === 'new') {
      const { error: dbError } = await supabase.from('ventajas').insert([payload]);
      if (dbError) setError(dbError.message);
      else { handleCancel(); fetchVentajas(); }
    } else {
      const { error: dbError } = await supabase.from('ventajas').update(payload).eq('id', editingId);
      if (dbError) setError(dbError.message);
      else { handleCancel(); fetchVentajas(); }
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Seguro que querés borrar esta ventaja?')) return;
    await supabase.from('ventajas').delete().eq('id', id);
    fetchVentajas();
  }

  if (checkingAuth) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando...</div>;

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
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Cerrar sesión</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', padding: '0 1.5rem', minWidth: 'max-content' }}>
          <Link href="/admin" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Reservas</Link>
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Configuración Web</Link>
          <Link href="/admin/ventajas" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Ventajas</Link>
          <Link href="/admin/testimonios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Testimonios</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--charcoal)', margin: 0 }}>Gestión de Ventajas (Por qué elegirnos)</h2>
          {editingId !== 'new' && (
            <button className="btn-primary" onClick={() => setEditingId('new')}>+ Agregar Ventaja</button>
          )}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}

        {editingId && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingId === 'new' ? 'Nueva Ventaja' : 'Editar Ventaja'}</h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label>Ícono (Emoji o Texto corto)</label>
                <input required className="input-field" value={form.icono} onChange={e => setForm({ ...form, icono: e.target.value })} />
              </div>
              <div>
                <label>Título</label>
                <input required className="input-field" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div>
                <label>Descripción</label>
                <textarea required className="input-field" rows={3} style={{ resize: 'vertical' }} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                <label style={{ margin: 0 }}>Ventaja Activa (visible al público)</label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">Guardar</button>
                <button type="button" className="btn-outline" onClick={handleCancel}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando ventajas...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Ícono</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Título</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Descripción</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventajas.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '1.5rem' }}>{v.icono}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{v.titulo}</td>
                    <td style={{ padding: '1rem', color: 'var(--muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.descripcion}</td>
                    <td style={{ padding: '1rem' }}>{v.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(v)} className="btn-outline" style={{ padding: '0.25rem 0.75rem' }}>Editar</button>
                      <button onClick={() => handleDelete(v.id)} className="btn-outline" style={{ padding: '0.25rem 0.75rem', color: 'red', borderColor: 'red' }}>Borrar</button>
                    </td>
                  </tr>
                ))}
                {ventajas.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No hay ventajas cargadas.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
