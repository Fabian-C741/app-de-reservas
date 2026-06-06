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
    hero_boton_texto: '',
    contacto_telefono: '',
    contacto_email: '',
    contacto_direccion: '',
    link_instagram: '',
    link_facebook: '',
    horario_manana_inicio: '09:00',
    horario_manana_fin: '13:00',
    horario_tarde_inicio: '14:00',
    horario_tarde_fin: '19:00',
    servicios_badge_texto: '',
    servicios_titulo: ''
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
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', padding: '0 1.5rem', minWidth: 'max-content' }}>
          <Link href="/admin" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Reservas</Link>
          <Link href="/admin/servicios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Servicios</Link>
          <Link href="/admin/configuracion" style={{ padding: '1rem 0', color: 'var(--rose)', borderBottom: '2px solid var(--rose)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Configuración Web</Link>
          <Link href="/admin/ventajas" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ventajas</Link>
          <Link href="/admin/testimonios" style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Testimonios</Link>
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
                    <input className="input-field" value={form.hero_titulo || ''} onChange={e => setForm({ ...form, hero_titulo: e.target.value })} />
                  </div>
                  <div>
                    <label>Subtítulo (Descripción corta)</label>
                    <textarea className="input-field" rows={2} style={{ resize: 'vertical' }} value={form.hero_subtitulo || ''} onChange={e => setForm({ ...form, hero_subtitulo: e.target.value })} />
                  </div>
                  <div>
                    <label>Texto del Botón Principal</label>
                    <input className="input-field" value={form.hero_boton_texto || ''} onChange={e => setForm({ ...form, hero_boton_texto: e.target.value })} />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Sección Servicios</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Etiqueta pequeña (ej: Nuestros servicios)</label>
                    <input className="input-field" value={form.servicios_badge_texto || ''} onChange={e => setForm({ ...form, servicios_badge_texto: e.target.value })} />
                  </div>
                  <div>
                    <label>Título de la sección</label>
                    <input className="input-field" value={form.servicios_titulo || ''} onChange={e => setForm({ ...form, servicios_titulo: e.target.value })} />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Contacto y Footer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Teléfono / WhatsApp</label>
                    <input className="input-field" value={form.contacto_telefono || ''} onChange={e => setForm({ ...form, contacto_telefono: e.target.value })} />
                  </div>
                  <div>
                    <label>Email de contacto</label>
                    <input type="email" className="input-field" value={form.contacto_email || ''} onChange={e => setForm({ ...form, contacto_email: e.target.value })} />
                  </div>
                  <div>
                    <label>Dirección del local</label>
                    <input className="input-field" value={form.contacto_direccion || ''} onChange={e => setForm({ ...form, contacto_direccion: e.target.value })} />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Horarios de Atención</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ color: 'var(--charcoal)', fontWeight: 600 }}>Turno Mañana</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input type="time" className="input-field" value={form.horario_manana_inicio || '09:00'} onChange={e => setForm({ ...form, horario_manana_inicio: e.target.value })} title="Inicio mañana" />
                      <span style={{ alignSelf: 'center' }}>a</span>
                      <input type="time" className="input-field" value={form.horario_manana_fin || '13:00'} onChange={e => setForm({ ...form, horario_manana_fin: e.target.value })} title="Fin mañana" />
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'var(--charcoal)', fontWeight: 600 }}>Turno Tarde</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input type="time" className="input-field" value={form.horario_tarde_inicio || '14:00'} onChange={e => setForm({ ...form, horario_tarde_inicio: e.target.value })} title="Inicio tarde" />
                      <span style={{ alignSelf: 'center' }}>a</span>
                      <input type="time" className="input-field" value={form.horario_tarde_fin || '19:00'} onChange={e => setForm({ ...form, horario_tarde_fin: e.target.value })} title="Fin tarde" />
                    </div>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--rose)' }}>Redes Sociales</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Link de Instagram</label>
                    <input type="url" placeholder="https://instagram.com/tuperfil" className="input-field" value={form.link_instagram || ''} onChange={e => setForm({ ...form, link_instagram: e.target.value })} />
                  </div>
                  <div>
                    <label>Link de Facebook</label>
                    <input type="url" placeholder="https://facebook.com/tuperfil" className="input-field" value={form.link_facebook || ''} onChange={e => setForm({ ...form, link_facebook: e.target.value })} />
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
