/**
 * Login del comercial (F3).
 *
 * El diseno aprobado no incluye esta pantalla (empieza ya dentro de la consola),
 * asi que se construyo sobria y en el mismo registro visual: es una puerta, no
 * una experiencia.
 *
 * SEGURIDAD (OWASP A07):
 *  - El mensaje de error es GENERICO. Nunca decimos si fallo el usuario o la
 *    contrasena: eso convierte el login en un oraculo para enumerar cuentas.
 *  - Aqui no se guarda ningun token. El backend emite una cookie httpOnly que
 *    este codigo no puede leer, y por eso despues del login solo revalidamos la
 *    sesion contra el servidor.
 *  - El rate limit vive en el backend (`authRateLimiter`): un limite en el
 *    cliente no limita a nadie.
 */

import { ArrowLeft } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useCloserSession } from '@shared/auth/use-closer-session';
import { cn } from '@shared/lib/cn';
import { loginCloser } from '../api/closer-dashboard.api';

/** Landing publica (`app/routes/index.tsx`). */
const RUTA_LANDING = '/';

/**
 * Credenciales de la DEMO, no de un entorno real.
 *
 * Quedan incrustadas en el bundle publico: cualquiera que abra "ver codigo
 * fuente" las lee, asi que solo pueden vivir aqui mientras el despliegue sea
 * una demo sin datos reales de titulares.
 *
 * Ademas solo abren la consola si coinciden exactamente con CLOSER_USERNAME /
 * CLOSER_PASSWORD del backend desplegado; si alli se rotan, este boton deja de
 * funcionar sin aviso y el error que vera el comercial sera el generico.
 *
 * BORRAR estas constantes y el boton "Usar credenciales de demo" cuando el
 * producto salga de demo.
 */
const DEMO_USUARIO = 'closer';
const DEMO_CONTRASENA = 'closer12345678';

const ERROR_GENERICO = 'Usuario o contraseña incorrectos.';

const CONTROL =
  'w-full rounded-xl border-[1.5px] border-console-edge bg-console-surface px-4 py-[13px] ' +
  'text-[15px] outline-none focus-visible:border-console-ink focus-ring';

const ETIQUETA =
  'mb-2 block font-mono text-[11px] font-bold tracking-[0.12em] text-console-mute uppercase';

export function CloserLoginPage(): ReactElement {
  const navigate = useNavigate();
  const { session, isLoading, refetch } = useCloserSession();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Ya hay sesion: no tiene sentido mostrar el formulario.
  if (!isLoading && session !== null) return <Navigate to="/closer" replace />;

  async function enviar(): Promise<void> {
    setEnviando(true);
    setError(null);

    const respuesta = await loginCloser({ usuario, contrasena });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(ERROR_GENERICO);
      return;
    }

    const sessionUpdated = await refetch();
    if (!sessionUpdated) {
      setError(ERROR_GENERICO);
      return;
    }
    void navigate('/closer', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-console-paper px-4 font-display text-console-ink antialiased">
      <div className="w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => {
            void navigate(RUTA_LANDING);
          }}
          className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded-pill border border-console-edge bg-console-surface px-3 py-1.5 text-[12px] font-semibold text-console-body transition-colors hover:border-console-ink hover:text-console-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Volver a la página principal
        </button>

        <div className="mb-8 flex items-center gap-[14px]">
          <img
            src="https://www.colsubsidio.com/campusvirtual/login-custom/img/colsubsidio1.png"
            alt="Colsubsidio"
            className="h-6 w-auto"
          />
          <span className="text-[15px] font-bold">Perfilador de leads</span>
        </div>

        <h1 className="mb-2.5 text-[32px] leading-none font-bold tracking-[-0.03em]">
          Consola closer
        </h1>
        <p className="mb-8 text-[15px] text-console-body">
          Acceso restringido al equipo comercial. Los leads que verás contienen datos personales de
          titulares que autorizaron su tratamiento.
        </p>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
          className="rounded-[20px] border border-console-line bg-console-surface p-7 shadow-console-card"
        >
          <div className="mb-5">
            <label className={ETIQUETA} htmlFor="closer-usuario">
              Usuario
            </label>
            <input
              id="closer-usuario"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
              }}
              className={CONTROL}
            />
          </div>

          <div className="mb-6">
            <label className={ETIQUETA} htmlFor="closer-contrasena">
              Contraseña
            </label>
            <input
              id="closer-contrasena"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={contrasena}
              onChange={(e) => {
                setContrasena(e.target.value);
              }}
              aria-describedby={error === null ? undefined : 'closer-login-error'}
              className={CONTROL}
            />
          </div>

          {error !== null && (
            <p
              id="closer-login-error"
              role="alert"
              className="mb-5 rounded-xl bg-console-red-soft px-4 py-3 text-[14px] font-bold text-console-red-deep"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={cn(
              'focus-ring w-full cursor-pointer rounded-full bg-console-ink px-6 py-[14px]',
              'text-[15px] font-bold text-console-signal transition-colors hover:bg-console-ink-3',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>

          {/* Rellena y se detiene: el comercial ve que valores va a enviar antes de "Entrar". */}
          <button
            type="button"
            onClick={() => {
              setUsuario(DEMO_USUARIO);
              setContrasena(DEMO_CONTRASENA);
              setError(null);
            }}
            className={cn(
              'focus-ring mt-3 w-full cursor-pointer rounded-full border border-console-edge',
              'bg-console-surface px-6 py-[11px] font-mono text-[11px] font-bold tracking-[0.12em]',
              'text-console-body uppercase transition-colors hover:border-console-ink hover:text-console-ink',
            )}
          >
            Usar credenciales de demo
          </button>
        </form>
      </div>
    </div>
  );
}
