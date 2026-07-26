/**
 * Login por OTP del lead (F2.2).
 *
 * Pantalla para volver a "Mi camino" sin repetir la conversación de F1: el lead
 * escribe su teléfono o correo (el mismo que dio en el chat), pide un código de
 * 6 dígitos y lo confirma. Dos pasos, un solo campo por paso — nada de
 * contraseña que recordar.
 *
 * SEGURIDAD (OWASP A07): al VERIFICAR, un código incorrecto y un contacto
 * inexistente son el MISMO mensaje genérico — distinguirlos permitiría enumerar
 * qué teléfonos/correos están registrados. Al PEDIR el código, la pantalla
 * muestra lo que responda el backend, que es quien decide cuánto revela: en
 * producción responde a ciegas y en dev dice la causa (ver
 * `lead-auth.controller.ts`). Igual que en `closer-login.page.tsx`, acá no se
 * guarda ningún token: el backend emite una cookie httpOnly que este código no
 * puede leer.
 */

import { useState, type ReactElement } from 'react';
import { Alert, Button, Card, Field } from '@shared/ui';
import { requestLeadOtp, verifyLeadOtp } from '../api/lead-auth';

const ERROR_GENERICO_CODIGO = 'Código inválido o vencido. Pide uno nuevo.';
const ERROR_GENERICO_ENVIO = 'No pudimos procesar la solicitud. Intenta de nuevo.';

export interface LeadLoginScreenProps {
  onSuccess: (leadId: string) => void;
  onCancel: () => void;
}

/** `@` en el contacto lo distingue de un teléfono: un solo campo, sin toggle. */
function contactoDesdeTexto(texto: string): { telefono: string | null; email: string | null } {
  const limpio = texto.trim();
  return limpio.includes('@') ? { telefono: null, email: limpio } : { telefono: limpio, email: null };
}

export function LeadLoginScreen({ onSuccess, onCancel }: LeadLoginScreenProps): ReactElement {
  const [paso, setPaso] = useState<'contacto' | 'codigo'>('contacto');
  const [contactoTexto, setContactoTexto] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [codigoDemo, setCodigoDemo] = useState<string | null>(null);

  async function pedirCodigo(): Promise<void> {
    setEnviando(true);
    setError(null);

    const respuesta = await requestLeadOtp(contactoDesdeTexto(contactoTexto));
    setEnviando(false);

    if (!respuesta.ok) {
      // El mensaje del backend cuando lo trae: fuera de producción distingue
      // "no existe una cuenta con ese contacto" de "falló el envío". Sin esto,
      // pedir el código para un correo que nunca hizo el chat era
      // indistinguible de un correo caído — y la pantalla avanzaba igual al
      // paso del código, a esperar un correo que no existía.
      setError(respuesta.error.message.length > 0 ? respuesta.error.message : ERROR_GENERICO_ENVIO);
      return;
    }
    // Fuera de producción el backend devuelve el código para poder probar el
    // flujo sin SMS/correo real (ver `lead-auth.controller.ts`).
    setCodigoDemo(respuesta.data.codigo ?? null);
    setPaso('codigo');
  }

  async function verificarCodigo(): Promise<void> {
    setEnviando(true);
    setError(null);

    const respuesta = await verifyLeadOtp({ ...contactoDesdeTexto(contactoTexto), codigo });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(ERROR_GENERICO_CODIGO);
      return;
    }
    onSuccess(respuesta.data.leadId);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-[420px]">
        <h1 className="mb-2 font-display text-2xl font-bold text-text">Vuelve a tu camino</h1>
        <p className="mb-6 text-sm text-text-muted">
          Escribe el teléfono o el correo que diste antes y te mandamos un código para retomar donde
          quedaste.
        </p>

        <Card>
          {paso === 'contacto' ? (
            <form
              noValidate
              onSubmit={(evento) => {
                evento.preventDefault();
                void pedirCodigo();
              }}
              className="flex flex-col gap-4"
            >
              <Field
                label="Teléfono o correo"
                type="text"
                autoComplete="tel"
                required
                value={contactoTexto}
                onChange={(evento) => {
                  setContactoTexto(evento.currentTarget.value);
                }}
              />
              {error !== null && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" variant="accent" fullWidth loading={enviando}>
                Pedir código
              </Button>
              <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
                Volver
              </Button>
            </form>
          ) : (
            <form
              noValidate
              onSubmit={(evento) => {
                evento.preventDefault();
                void verificarCodigo();
              }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-text-muted">
                Te mandamos un código de 6 dígitos a <strong>{contactoTexto}</strong>.
              </p>
              {codigoDemo !== null && (
                <Alert tone="info">Modo demo: tu código es {codigoDemo}.</Alert>
              )}
              <Field
                label="Código de 6 dígitos"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={codigo}
                onChange={(evento) => {
                  setCodigo(evento.currentTarget.value.replace(/\D/gu, '').slice(0, 6));
                }}
              />
              {error !== null && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" variant="accent" fullWidth loading={enviando}>
                Entrar
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setPaso('contacto');
                  setCodigo('');
                  setError(null);
                }}
              >
                Usar otro teléfono o correo
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
