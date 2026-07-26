/**
 * Gate de entrada al módulo educativo (F2.2).
 *
 * Se interpone entre F1 y "Mi camino" cuando el lead sale del chat como
 * `no_viable`: apenas monta, pide un código al correo que el propio lead ya
 * declaró en la conversación — no se le vuelve a preguntar nada. Sin ese código
 * no hay cookie de sesión, y sin cookie el backend responde 401 en `/journey` y
 * `/progress` (`require-lead.ts`), así que la pantalla no es un adorno: es la
 * única puerta.
 *
 * Se diferencia de `LeadLoginScreen` en el punto de partida: acá ya sabemos
 * QUIÉN es (tenemos su `leadId`) y solo falta probar que el correo es suyo;
 * allá no sabemos quién es y hay que identificarlo primero.
 *
 * SEGURIDAD: el correo se muestra ENMASCARADO tal como lo devuelve el backend
 * (`pe*****@correo.com`) — suficiente para saber qué bandeja abrir, sin exponer
 * el correo completo a quien solo tenga el `leadId`.
 */

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { Alert, Button, Card, Field } from '@shared/ui';
import { requestLeadOtp, verifyLeadOtp } from '../api/lead-auth';

const ERROR_CODIGO = 'Código inválido o vencido. Pedí uno nuevo.';
const ERROR_ENVIO = 'No pudimos enviarte el código. Intentá de nuevo.';
const SEGUNDOS_REENVIO = 30;

export interface LeadOtpGateScreenProps {
  leadId: string;
  /** Solo se llama con el código ya verificado: acá adentro se emitió la cookie. */
  onVerificado: (leadId: string) => void;
}

export function LeadOtpGateScreen({ leadId, onVerificado }: LeadOtpGateScreenProps): ReactElement {
  const [destino, setDestino] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [codigoDemo, setCodigoDemo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviandoCodigo, setEnviandoCodigo] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [esperaReenvio, setEsperaReenvio] = useState(SEGUNDOS_REENVIO);

  const pedirCodigo = useCallback(async (): Promise<void> => {
    setEnviandoCodigo(true);
    setError(null);

    const respuesta = await requestLeadOtp({ leadId });
    setEnviandoCodigo(false);

    if (!respuesta.ok) {
      // El mensaje del backend cuando lo hay: fuera de producción distingue
      // "no existe esa cuenta" de "falló el envío", que es justo lo que el
      // texto genérico ocultaba mientras se creía que el SMTP estaba caído.
      setError(respuesta.error.message.length > 0 ? respuesta.error.message : ERROR_ENVIO);
      return;
    }
    setDestino(respuesta.data.destino ?? null);
    // Fuera de producción el backend devuelve el código para poder probar el
    // flujo sin bandeja de entrada real (ver `lead-auth.controller.ts`).
    setCodigoDemo(respuesta.data.codigo ?? null);
    setEsperaReenvio(SEGUNDOS_REENVIO);
  }, [leadId]);

  // StrictMode monta dos veces en dev: sin este candado el lead recibe dos
  // correos y el primer código queda invalidado por el segundo.
  const yaPedido = useRef(false);
  useEffect(() => {
    if (yaPedido.current) return;
    yaPedido.current = true;
    void pedirCodigo();
  }, [pedirCodigo]);

  useEffect(() => {
    if (esperaReenvio <= 0) return undefined;
    const id = setTimeout(() => {
      setEsperaReenvio((segundos) => segundos - 1);
    }, 1000);
    return () => {
      clearTimeout(id);
    };
  }, [esperaReenvio]);

  async function verificar(): Promise<void> {
    setVerificando(true);
    setError(null);

    const respuesta = await verifyLeadOtp({ leadId, codigo });
    setVerificando(false);

    if (!respuesta.ok) {
      setError(ERROR_CODIGO);
      setCodigo('');
      return;
    }
    onVerificado(respuesta.data.leadId);
  }

  const puedeReenviar = esperaReenvio <= 0 && !enviandoCodigo;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-[420px]">
        <h1 className="mb-2 font-display text-2xl font-bold text-text">Confirmá que sos vos</h1>
        <p className="mb-6 text-sm text-text-muted">
          {destino !== null ? (
            <>
              Te enviamos un código de 6 dígitos a <strong className="text-text">{destino}</strong>.
              Escribilo acá para entrar a tu camino.
            </>
          ) : (
            'Te enviamos un código de 6 dígitos al correo que nos diste en el chat.'
          )}
        </p>

        <Card>
          <form
            noValidate
            onSubmit={(evento) => {
              evento.preventDefault();
              void verificar();
            }}
            className="flex flex-col gap-4"
          >
            {codigoDemo !== null && <Alert tone="info">Modo demo: tu código es {codigoDemo}.</Alert>}
            <Field
              label="Código de 6 dígitos"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              value={codigo}
              onChange={(evento) => {
                setCodigo(evento.currentTarget.value.replace(/\D/gu, '').slice(0, 6));
              }}
            />
            {error !== null && <Alert tone="danger">{error}</Alert>}
            <Button
              type="submit"
              variant="accent"
              fullWidth
              loading={verificando}
              disabled={codigo.length < 6}
            >
              Entrar a mi camino
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              loading={enviandoCodigo}
              disabled={!puedeReenviar}
              onClick={() => {
                void pedirCodigo();
              }}
            >
              {puedeReenviar
                ? 'Reenviar código'
                : `Reenviar código en ${String(Math.max(esperaReenvio, 0))}s`}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-text-muted">
          ¿No te llegó? Revisá la carpeta de spam antes de pedir otro.
        </p>
      </div>
    </div>
  );
}
