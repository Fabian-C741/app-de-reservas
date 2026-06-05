'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function ServiciosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: '', duracion_minutos: 60, precio: 0, categoria: '', activo: true });

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setCheckingAuth(false); fetchServicios(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push('/login'); else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchServicios() {
    setLoading(true);
    const { data } = await supabase.from('servicios').select('*').order('id', { ascending: true });
    if (data) setServicios(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function handleEdit(s) {
    setEditingId(s.id);
    setForm({ nombre: s.nombre, duracion_minutos: s.duracion_minutos, precio: s.precio, categoria: s.categoria || '', activo: s.activo });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ nombre: '', duracion_minutos: 60, precio: 0, categoria: '', activo: true });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, duracion_minutos: Number(form.duracion_minutos), precio: Number(form.precio) };

    if (editingId === 'new') {
      const { error: dbError } = await supabase.from('servicios').insert([payload]);
      if (dbError) setError(dbError.message);
      else { handleCancel(); fetchServicios(); }
    } else {
      const { error: dbError } = await supabase.from('servicios').update(payload).eq('id', editingId);
      if (dbError) setError(dbError.message);
      else { handleCancel(); fetchServicios(); }
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Seguro que querés borrar este servicio? Esto no se puede deshacer.')) return;
    await supabase.from('servicios').delete().eq('id', id);
    fetchServicios();
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
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', padding: '0 1.5rem' }}>
          <Link href="/admin" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}>Reservas</Link>
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}>Configuración Web</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--charcoal)', margin: 0 }}>Gestión de Servicios</h2>
          {editingId !== 'new' && (
            <button className="btn-primary" onClick={() => setEditingId('new')}>+ Agregar Servicio</button>
          )}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}

        {editingId && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingId === 'new' ? 'Nuevo Servicio' : 'Editar Servicio'}</h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Nombre</label>
                <input required className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label>Categoría (Ej: Cabello, Uñas)</label>
                <input className="input-field" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div>
                <label>Precio ($)</label>
                <input required type="number" className="input-field" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
              </div>
              <div>
                <label>Duración (Minutos)</label>
                <input required type="number" className="input-field" value={form.duracion_minutos} onChange={e => setForm({ ...form, duracion_minutos: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                <label style={{ margin: 0 }}>Servicio Activo (visible al público)</label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">Guardar</button>
                <button type="button" className="btn-outline" onClick={handleCancel}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando servicios...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Nombre</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Categoría</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Precio</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Duración</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{s.nombre}</td>
                    <td style={{ padding: '1rem', color: 'var(--muted)' }}>{s.categoria || '-'}</td>
                    <td style={{ padding: '1rem' }}>${s.precio.toLocaleString('es-AR')}</td>
                    <td style={{ padding: '1rem' }}>{s.duracion_minutos} min</td>
                    <td style={{ padding: '1rem' }}>{s.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(s)} className="btn-outline" style={{ padding: '0.25rem 0.75rem' }}>Editar</button>
                      <button onClick={() => handleDelete(s.id)} className="btn-outline" style={{ padding: '0.25rem 0.75rem', color: 'red', borderColor: 'red' }}>Borrar</button>
                    </td>
                  </tr>
                ))}
                {servicios.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No hay servicios cargados.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
