'use client';
import Link from 'next/link';



import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [ventajas, setVentajas] = useState([]);
  const [testimonios, setTestimonios] = useState([]);

  useEffect(() => {
    supabase.from('configuracion_web').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setConfig(data);
    });
    supabase.from('servicios').select('*').eq('activo', true).limit(6).then(({ data }) => {
      if (data) setServicios(data);
    });
    supabase.from('ventajas').select('*').eq('activo', true).then(({ data }) => {
      if (data) setVentajas(data);
    });
    supabase.from('testimonios').select('*').eq('activo', true).then(({ data }) => {
      if (data) setTestimonios(data);
    });
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--blush) 50%, var(--cream) 100%)',
        padding: '6rem 1.5rem 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(194,24,91,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <span className="badge badge-rose fade-in-up" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            ✦ &nbsp; Belleza & Bienestar Profesional
          </span>

          <h1 className="fade-in-up delay-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
            {config ? config.hero_titulo : 'Tu mejor versión empieza en Alme'}
          </h1>

          <p className="fade-in-up delay-2" style={{ fontSize: '1.125rem', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            {config ? config.hero_subtitulo : 'Reservá tu cita en segundos y descubrí por qué somos el lugar favorito de belleza.'}
          </p>

          <div className="fade-in-up delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/reservar" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
              {config?.hero_boton_texto || 'Reservar mi cita →'}
            </Link>
            <Link href="/servicios" className="btn-outline" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
              Ver servicios
            </Link>
          </div>

          {/* Stats */}
          <div className="fade-in-up delay-4" style={{
            display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
            marginTop: '4rem',
          }}>
            {[['500+', 'Clientas felices'], ['8', 'Servicios premium'], ['5★', 'Calificación promedio'], ['3+', 'Años de experiencia']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--rose)' }}>{num}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>¿Por qué elegirnos?</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--charcoal)' }}>
              Una experiencia diferente
            </h2>
            <div className="divider" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {ventajas.map((v) => (
              <div key={v.id} className="card" style={{ padding: '2rem 1.75rem' }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'linear-gradient(135deg, var(--blush), var(--rose-light))',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1.25rem',
                }}>{v.icono}</div>
                <h3 style={{ fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", color: 'var(--charcoal)', marginBottom: '0.625rem' }}>{v.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{v.descripcion}</p>
              </div>
            ))}
            {ventajas.length === 0 && <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>Cargando ventajas...</div>}
          </div>
        </div>
      </section>

      {/* ── Services Preview ──────────────────────────────── */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-rose" style={{ marginBottom: '0.75rem' }}>Nuestros servicios</span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--charcoal)' }}>
                Tratamientos que te van a encantar
              </h2>
              <div className="divider divider-left" />
            </div>
            <Link href="/servicios" className="btn-ghost">Ver todos →</Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {servicios.map((s) => (
              <div key={s.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>✨</span>
                  <span className="badge badge-rose">{s.categoria || 'General'}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontFamily: "'Playfair Display', serif", color: 'var(--charcoal)', marginBottom: '0.5rem' }}>{s.nombre}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--rose)', fontSize: '1.05rem' }}>${s.precio.toLocaleString('es-AR')}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>⏱ {s.duracion_minutos} min</span>
                </div>
              </div>
            ))}
            {servicios.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>Cargando servicios...</div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/reservar" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
              Reservar ahora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, var(--rose-dark) 0%, var(--rose) 100%)',
        color: '#fff',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.75rem' }}>Testimonios</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff' }}>
              Lo que dicen nuestras clientas
            </h2>
            <div className="divider" style={{ background: 'rgba(255,255,255,0.4)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {testimonios.map((t) => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
              }}>
                <div style={{ color: '#FFD700', fontSize: '1rem', marginBottom: '0.75rem' }}>
                  {'★'.repeat(t.estrellas)}
                </div>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: '1.25rem' }}>
                  "{t.texto}"
                </p>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                  — {t.nombre_cliente}
                </div>
              </div>
            ))}
            {testimonios.length === 0 && <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>Cargando testimonios...</div>}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <span style={{ fontSize: '3rem' }}>✦</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--charcoal)', margin: '1rem 0 0.75rem' }}>
            ¿Lista para tu próxima cita?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Reservá en segundos, sin llamadas. Elegí tu servicio, tu día y tu hora favorita.
          </p>
          <Link href="/reservar" className="btn-primary" style={{ fontSize: '1.0625rem', padding: '1.125rem 2.75rem' }}>
            {config?.hero_boton_texto || 'Reservar mi cita gratis →'}
          </Link>
        </div>
      </section>
    </>
  );
}