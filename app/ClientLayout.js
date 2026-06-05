'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function ClientLayout({ children }) {
  return (
    <>
      <Nav />
      <main style={{ minHeight: 'calc(100vh - 72px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/reservar', label: 'Reservar' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,250,247,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '72px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--rose), var(--rose-dark))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.1rem',
          }}>✦</span>
          <span style={{ fontFamily: "'Playfair Display', serif" }}>
            <span style={{ color: 'var(--rose)', fontWeight: 700, fontSize: '1.1rem' }}>Alme</span>{' '}
            <span style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic', fontSize: '1rem' }}>cosmetología</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: pathname === l.href ? 'var(--rose)' : 'var(--muted)',
              background: pathname === l.href ? 'var(--blush)' : 'transparent',
              transition: 'color 0.2s, background 0.2s',
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/reservar" className="btn-primary" style={{ marginLeft: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
            Reservar cita
          </Link>
          <Link href="/admin" className="btn-ghost" style={{ fontSize: '0.8rem' }}>
            Admin
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
          className="hamburger"
          aria-label="Menú"
        >
          <div style={{ width: 22, height: 2, background: 'var(--charcoal)', marginBottom: 5, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: 'var(--charcoal)', marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <div style={{ width: 22, height: 2, background: 'var(--charcoal)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 500,
                color: pathname === l.href ? 'var(--rose)' : 'var(--charcoal)',
                background: pathname === l.href ? 'var(--blush)' : 'transparent',
              }}>
              {l.label}
            </Link>
          ))}
          <Link href="/reservar" onClick={() => setMenuOpen(false)}
            className="btn-primary" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            Reservar cita
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      background: 'var(--charcoal)',
      color: '#E0E0E0',
      padding: '3rem 1.5rem 2rem',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem',
      }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem' }}>
            <span style={{ color: 'var(--rose-light)' }}>Alme</span>{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>cosmetología</span>
          </span>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9E9E9E', lineHeight: 1.7 }}>
            Tu bienestar y belleza son nuestra prioridad. Profesionales apasionadas por hacer brillar tu mejor versión.
          </p>
        </div>
        <div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Navegación</h4>
          {[['/', 'Inicio'], ['/servicios', 'Servicios'], ['/reservar', 'Reservar cita']].map(([href, label]) => (
            <Link key={href} href={href} style={{ display: 'block', color: '#9E9E9E', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Contacto</h4>
          <p style={{ fontSize: '0.875rem', color: '#9E9E9E', marginBottom: '0.5rem' }}>📍 Tu ciudad, Argentina</p>
          <p style={{ fontSize: '0.875rem', color: '#9E9E9E', marginBottom: '0.5rem' }}>📞 +54 11 0000-0000</p>
          <p style={{ fontSize: '0.875rem', color: '#9E9E9E' }}>📧 hola@almecosmetologia.com</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #333', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#757575' }}>
        © {new Date().getFullYear()} Alme Cosmetología Integral. Todos los derechos reservados.
      </div>
    </footer>
  );
}
