'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Por favor completá email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Credenciales incorrectas. Verificá tu email y contraseña.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Hubo un error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--rose-dark) 0%, var(--rose) 50%, #e91e8c 100%)',
      padding: '2rem 1rem',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '10%', left: '5%',
        width: 300, height: 300,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '5%',
        width: 200, height: 200,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 1rem',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem',
          }}>✦</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.625rem',
            color: '#fff',
            fontWeight: 700,
          }}>
            Panel Administrador
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Alme Cosmetología Integral
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@alme.com"
                autoComplete="email"
                className="input-field"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  marginTop: '0.375rem',
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative', marginTop: '0.375rem' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                    paddingRight: '3rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(198,40,40,0.25)',
                border: '1px solid rgba(239,154,154,0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFCDD2',
                fontSize: '0.875rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.9375rem',
                background: loading ? 'rgba(255,255,255,0.2)' : '#fff',
                color: loading ? 'rgba(255,255,255,0.6)' : 'var(--rose-dark)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; }}
            >
              {loading ? (
                <><div className="spinner" style={{ borderTopColor: 'var(--rose)', borderColor: 'rgba(255,255,255,0.3)' }} /> Ingresando...</>
              ) : 'Ingresar al panel →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Acceso exclusivo para administradoras
        </p>
      </div>

      {/* Placeholder input color fix */}
      <style>{`
        #login-email::placeholder, #login-password::placeholder { color: rgba(255,255,255,0.4); }
        #login-email, #login-password { color: #fff; }
      `}</style>
    </div>
  );
}
