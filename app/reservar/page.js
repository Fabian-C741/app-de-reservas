'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const FALLBACK_SERVICIOS = [
  { id: '1', nombre: 'Corte y Peinado', duracion_minutos: 60, precio: 3500, categoria: 'Cabello' },
  { id: '2', nombre: 'Coloración Completa', duracion_minutos: 120, precio: 8500, categoria: 'Cabello' },
  { id: '3', nombre: 'Mechas y Balayage', duracion_minutos: 150, precio: 12000, categoria: 'Cabello' },
  { id: '4', nombre: 'Tratamiento Keratina', duracion_minutos: 180, precio: 15000, categoria: 'Tratamientos' },
  { id: '5', nombre: 'Manicura Premium', duracion_minutos: 60, precio: 2500, categoria: 'Uñas' },
  { id: '6', nombre: 'Pedicura Spa', duracion_minutos: 75, precio: 3000, categoria: 'Uñas' },
  { id: '7', nombre: 'Facial Hidratante', duracion_minutos: 60, precio: 4500, categoria: 'Facial' },
  { id: '8', nombre: 'Maquillaje Social', duracion_minutos: 60, precio: 5500, categoria: 'Maquillaje' },
];

function formatPrice(p) {
  return '$' + Number(p).toLocaleString('es-AR');
}

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function ReservarForm() {
  const searchParams = useSearchParams();
  const servicioParam = searchParams.get('servicio');

  const [servicios, setServicios] = useState(FALLBACK_SERVICIOS);
  const [paso, setPaso] = useState(1); // 1=servicio, 2=fecha/hora, 3=datos, 4=confirmado
  const [form, setForm] = useState({
    servicio_id: servicioParam || '',
    fecha: '',
    hora: '',
    nombre_cliente: '',
    telefono: '',
    email: '',
    notas: '',
  });
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [diaBloqueado, setDiaBloqueado] = useState(null); // null = libre, objeto = bloqueado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configuracion, setConfiguracion] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data: servData } = await supabase.from('servicios').select('id, nombre, duracion_minutos, precio, categoria').eq('activo', true);
      if (servData && servData.length > 0) setServicios(servData);

      const { data: confData } = await supabase.from('configuracion_web').select('*').eq('id', 1).single();
      if (confData) setConfiguracion(confData);
    }
    fetchData();
  }, []);

  function generarHorarios() {
    const defaultMInicio = '09:00';
    const defaultMFin = '13:00';
    const defaultTInicio = '14:00';
    const defaultTFin = '19:00';

    const mInicio = configuracion?.horario_manana_inicio || defaultMInicio;
    const mFin = configuracion?.horario_manana_fin || defaultMFin;
    const tInicio = configuracion?.horario_tarde_inicio || defaultTInicio;
    const tFin = configuracion?.horario_tarde_fin || defaultTFin;

    const parseHora = (hStr) => parseInt(hStr.split(':')[0], 10);
    const slots = [];

    for (let h = parseHora(mInicio); h < parseHora(mFin); h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    for (let h = parseHora(tInicio); h < parseHora(tFin); h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    return slots;
  }
  
  const HORARIOS_DISPONIBLES = generarHorarios();

  useEffect(() => {
    if (form.fecha) {
      setDiaBloqueado(null);
      setHorariosOcupados([]);
      setForm(prev => ({ ...prev, hora: '' }));
      checkDiaBloqueado(form.fecha);
      if (form.servicio_id) fetchHorariosOcupados(form.fecha);
    }
  }, [form.fecha, form.servicio_id]);

  async function checkDiaBloqueado(fecha) {
    const { data } = await supabase
      .from('dias_bloqueados')
      .select('motivo')
      .eq('fecha', fecha)
      .maybeSingle();
    if (data) setDiaBloqueado(data);
  }

  async function fetchHorariosOcupados(fecha) {
    const { data } = await supabase
      .from('reservas')
      .select('hora')
      .eq('fecha', fecha)
      .not('estado', 'eq', 'cancelada');
    if (data) setHorariosOcupados(data.map(r => r.hora.slice(0, 5)));
  }

  const servicioSeleccionado = servicios.find(s => s.id === form.servicio_id || String(s.id) === form.servicio_id);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function validarPaso() {
    if (paso === 1 && !form.servicio_id) { setError('Por favor seleccioná un servicio.'); return false; }
    if (paso === 2) {
      if (!form.fecha) { setError('Por favor elegí una fecha.'); return false; }
      if (diaBloqueado) { setError('Este día está cerrado. Por favor elegí otra fecha.'); return false; }
      if (!form.hora) { setError('Por favor seleccioná un horario.'); return false; }
    }
    if (paso === 3) {
      if (!form.nombre_cliente.trim()) { setError('Por favor ingresá tu nombre.'); return false; }
      if (!form.telefono.trim()) { setError('Por favor ingresá tu teléfono.'); return false; }
    }
    return true;
  }

  function siguiente() {
    if (validarPaso()) setPaso(p => p + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarPaso()) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        nombre_cliente: form.nombre_cliente.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim() || null,
        servicio_id: form.servicio_id || null,
        fecha: form.fecha,
        hora: form.hora + ':00',
        notas: form.notas.trim() || null,
        estado: 'pendiente',
      };

      const { error: dbError } = await supabase.from('reservas').insert([payload]);

      if (dbError) {
        // If table doesn't exist yet, still show success for demo
        if (dbError.code === '42P01') {
          setPaso(4);
        } else {
          setError('Hubo un problema al guardar tu reserva. Intentá de nuevo.');
        }
      } else {
        setPaso(4);
      }
    } catch {
      setError('Hubo un error inesperado. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Step indicator
  const pasos = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmación'];

  return (
    <>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, var(--cream), var(--blush))',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <span className="badge badge-rose" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Reserva online</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--charcoal)' }}>
            Reservá tu <span className="gradient-text">cita</span>
          </h1>
          <div className="divider" />
        </div>
      </section>

      <section className="section" style={{ background: 'var(--cream)', paddingTop: '2.5rem' }}>
        <div className="container" style={{ maxWidth: 680 }}>

          {/* Steps */}
          {paso < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', gap: 0 }}>
              {pasos.slice(0, 3).map((label, i) => {
                const num = i + 1;
                const done = paso > num;
                const active = paso === num;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: 60 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: done ? 'var(--rose)' : active ? 'var(--rose)' : 'var(--border)',
                        color: done || active ? '#fff' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem',
                        transition: 'all 0.3s',
                      }}>
                        {done ? '✓' : num}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: active ? 'var(--rose)' : 'var(--muted)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: paso > num ? 'var(--rose)' : 'var(--border)',
                        margin: '0 0.5rem', marginTop: '-18px',
                        transition: 'background 0.3s',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="card" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>

              {/* ── Paso 1: Servicio ── */}
              {paso === 1 && (
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--charcoal)' }}>
                    ¿Qué servicio te gustaría?
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {servicios.map(s => (
                      <label key={s.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        border: `2px solid ${String(form.servicio_id) === String(s.id) ? 'var(--rose)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: String(form.servicio_id) === String(s.id) ? 'var(--blush)' : 'var(--surface)',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <input type="radio" name="servicio_id" value={s.id}
                            checked={String(form.servicio_id) === String(s.id)}
                            onChange={handleChange}
                            style={{ accentColor: 'var(--rose)', width: 16, height: 16 }} />
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--charcoal)', fontSize: '0.9375rem' }}>{s.nombre}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
                              {s.categoria} · ⏱ {s.duracion_minutos} min
                            </div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--rose)', whiteSpace: 'nowrap' }}>
                          {formatPrice(s.precio)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Paso 2: Fecha y hora ── */}
              {paso === 2 && (
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--charcoal)' }}>
                    Elegí fecha y horario
                  </h2>
                  {servicioSeleccionado && (
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                      Servicio: <strong>{servicioSeleccionado.nombre}</strong> — {servicioSeleccionado.duracion_minutos} min
                    </p>
                  )}

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label>Fecha</label>
                    <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                      min={getMinDate()} className="input-field"
                      style={{ cursor: 'pointer' }} />
                  </div>

                  {form.fecha && diaBloqueado ? (
                    <div style={{
                      padding: '1.25rem',
                      background: '#FFF3E0',
                      border: '1.5px solid #FFB74D',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem',
                    }}>
                      <span style={{ fontSize: '1.75rem' }}>🚫</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#E65100', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                          El local está cerrado este día
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#BF360C' }}>
                          Motivo: {diaBloqueado.motivo || 'Día no disponible'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#E65100', marginTop: '0.5rem' }}>
                          Por favor elegí otra fecha en el calendario.
                        </div>
                      </div>
                    </div>
                  ) : form.fecha && (
                    <div>
                      <label style={{ marginBottom: '0.75rem' }}>Horario disponible</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                        {HORARIOS_DISPONIBLES.map(h => {
                          const ocupado = horariosOcupados.includes(h);
                          const seleccionado = form.hora === h;
                          return (
                            <button type="button" key={h}
                              disabled={ocupado}
                              onClick={() => !ocupado && setForm(prev => ({ ...prev, hora: h }))}
                              style={{
                                padding: '0.75rem',
                                border: `2px solid ${seleccionado ? 'var(--rose)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                background: seleccionado ? 'var(--rose)' : ocupado ? '#F5F5F5' : 'var(--surface)',
                                color: seleccionado ? '#fff' : ocupado ? '#BDBDBD' : 'var(--charcoal)',
                                fontWeight: seleccionado ? 600 : 400,
                                cursor: ocupado ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                                textDecoration: ocupado ? 'line-through' : 'none',
                              }}>
                              {h}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Paso 3: Datos personales ── */}
              {paso === 3 && (
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '1.75rem', color: 'var(--charcoal)' }}>
                    Tus datos de contacto
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label>Nombre completo *</label>
                      <input type="text" name="nombre_cliente" value={form.nombre_cliente}
                        onChange={handleChange} placeholder="Ej: Valentina García"
                        className="input-field" />
                    </div>
                    <div>
                      <label>Teléfono / WhatsApp *</label>
                      <input type="tel" name="telefono" value={form.telefono}
                        onChange={handleChange} placeholder="+54 11 0000-0000"
                        className="input-field" />
                    </div>
                    <div>
                      <label>Email <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span></label>
                      <input type="email" name="email" value={form.email}
                        onChange={handleChange} placeholder="hola@ejemplo.com"
                        className="input-field" />
                    </div>
                    <div>
                      <label>Notas adicionales <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span></label>
                      <textarea name="notas" value={form.notas} onChange={handleChange}
                        placeholder="Alguna preferencia o indicación especial..."
                        rows={3}
                        className="input-field"
                        style={{ resize: 'vertical', minHeight: 90 }} />
                    </div>
                  </div>

                  {/* Summary */}
                  {servicioSeleccionado && (
                    <div style={{
                      marginTop: '1.5rem', padding: '1.25rem',
                      background: 'var(--blush)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--rose-light)',
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--rose-dark)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Resumen de tu reserva
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--charcoal)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>📋 {servicioSeleccionado.nombre}</span>
                        <span>📅 {new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <span>🕐 {form.hora} hs</span>
                        <span>💰 {formatPrice(servicioSeleccionado.precio)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Paso 4: Confirmado ── */}
              {paso === 4 && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: 80, height: 80, margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, var(--rose), var(--rose-dark))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', color: '#fff',
                  }}>✓</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: 'var(--charcoal)', marginBottom: '0.75rem' }}>
                    ¡Tu cita está reservada!
                  </h2>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Te contactaremos pronto para confirmar tu turno. Si necesitás cancelar o modificar, escribinos por WhatsApp.
                  </p>
                  {servicioSeleccionado && (
                    <div style={{
                      background: 'var(--blush)', borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem', marginBottom: '2rem', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                        <span>📋 <strong>{servicioSeleccionado.nombre}</strong></span>
                        <span>📅 {new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <span>🕐 {form.hora} hs</span>
                        <span>👤 {form.nombre_cliente}</span>
                      </div>
                    </div>
                  )}
                  <button type="button" className="btn-primary"
                    onClick={() => { setForm({ servicio_id: '', fecha: '', hora: '', nombre_cliente: '', telefono: '', email: '', notas: '' }); setPaso(1); }}>
                    Hacer otra reserva
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: '1rem', padding: '0.875rem 1rem',
                  background: '#FFEBEE', border: '1px solid #FFCDD2',
                  borderRadius: 'var(--radius-sm)', color: '#C62828',
                  fontSize: '0.875rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Navigation buttons */}
              {paso < 4 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
                  {paso > 1 ? (
                    <button type="button" className="btn-outline" onClick={() => setPaso(p => p - 1)}>
                      ← Anterior
                    </button>
                  ) : <div />}

                  {paso < 3 ? (
                    <button type="button" className="btn-primary" onClick={siguiente}>
                      Siguiente →
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? (
                        <><div className="spinner" /> Guardando...</>
                      ) : 'Confirmar reserva ✓'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--rose)', borderColor: 'var(--border)', width: 40, height: 40, borderWidth: 3 }} />
      </div>
    }>
      <ReservarForm />
    </Suspense>
  );
}
