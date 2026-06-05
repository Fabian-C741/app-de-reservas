import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Alme Cosmetología Integral — Reservá tu cita',
  description: 'Reserva online tu cita en Alme Cosmetología Integral. Tratamientos de belleza, cortes, coloración, facial y más.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}