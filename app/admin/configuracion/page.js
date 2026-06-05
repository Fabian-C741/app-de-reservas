'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function ConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    hero_titulo: '',
    hero_subtitulo: '',
    contacto_telefono: '',
    contacto_email: '',
    contacto_direccion: ''
  });

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setCheckingAuth(false); fetchConfig(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push('/login'); else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase.from('configuracion_web').select('*').eq('id', 1).single();
    if (data) setForm(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.from('configuracion_web').update(form).eq('id', 1);
    
    if (error) setMessage('❌ Error al guardar: ' + error.message);
    else setMessage('✅ Configuración guardada correctamente.');
    
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
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
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem' }}>Configuración Web</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--charcoal)', marginBottom: '1.5rem' }}>Textos de la Web</h2>

        {loading ? (
           <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>
        ) : (
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Inicio (Bienvenida)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Título Principal</label>
                    <input className="input-field" value={form.hero_titulo} onChange={e => setForm({ ...form, hero_titulo: e.target.value })} />
                  </div>
                  <div>
                    <label>Subtítulo (Descripción corta)</label>
                    <textarea className="input-field" rows={2} style={{ resize: 'vertical' }} value={form.hero_subtitulo} onChange={e => setForm({ ...form, hero_subtitulo: e.target.value })} />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Contacto y Footer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Teléfono / WhatsApp</label>
                    <input className="input-field" value={form.contacto_telefono} onChange={e => setForm({ ...form, contacto_telefono: e.target.value })} />
                  </div>
                  <div>
                    <label>Email de contacto</label>
                    <input type="email" className="input-field" value={form.contacto_email} onChange={e => setForm({ ...form, contacto_email: e.target.value })} />
                  </div>
                  <div>
                    <label>Dirección del local</label>
                    <input className="input-field" value={form.contacto_direccion} onChange={e => setForm({ ...form, contacto_direccion: e.target.value })} />
                  </div>
                </div>
              </div>

              {message && <div style={{ padding: '1rem', background: message.includes('❌') ? '#ffebee' : '#e8f5e9', color: message.includes('❌') ? '#c62828' : '#2e7d32', borderRadius: '8px' }}>{message}</div>}

              <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
