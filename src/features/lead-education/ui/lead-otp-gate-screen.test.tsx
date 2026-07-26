/**
 * Cubre el gate de entrada al módulo educativo (F2.2, adenda A14): el código
 * se pide SOLO con el `leadId` (el correo ya lo dio en el chat), el destino se
 * muestra enmascarado, y `onVerificado` no se llama hasta que el backend
 * acepta el código — que es justo lo que hace que la pantalla sea una puerta
 * y no un aviso.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadOtpGateScreen } from './lead-otp-gate-screen';
import { requestLeadOtp, verifyLeadOtp } from '../api/lead-auth';

vi.mock('../api/lead-auth', () => ({
  requestLeadOtp: vi.fn(),
  verifyLeadOtp: vi.fn(),
}));

const requestMock = vi.mocked(requestLeadOtp);
const verifyMock = vi.mocked(verifyLeadOtp);

function okRequest(data: { enviado: boolean; destino?: string | null; codigo?: string }) {
  return Promise.resolve({ ok: true as const, data });
}

beforeEach(() => {
  vi.clearAllMocks();
  requestMock.mockReturnValue(okRequest({ enviado: true, destino: 'pe*****@correo.com' }));
});

describe('LeadOtpGateScreen', () => {
  it('al montar pide el código solo con el leadId, sin volver a preguntar el correo', async () => {
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={vi.fn()} />);

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledWith({ leadId: 'lead-1' });
    });
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText(/correo/iu)).not.toBeInTheDocument();
  });

  it('muestra el destino ENMASCARADO que devuelve el backend', async () => {
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={vi.fn()} />);

    expect(await screen.findByText('pe*****@correo.com')).toBeInTheDocument();
  });

  it('no deja entrar con un código incorrecto: avisa y no llama a onVerificado', async () => {
    const user = userEvent.setup();
    const onVerificado = vi.fn();
    verifyMock.mockReturnValue(
      Promise.resolve({
        ok: false as const,
        error: { code: 'UNAUTHORIZED', message: 'nope', fields: null },
      }),
    );
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={onVerificado} />);

    await user.type(await screen.findByLabelText(/Código de 6 dígitos/u), '000000');
    await user.click(screen.getByRole('button', { name: 'Entrar a mi camino' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Código inválido/u);
    expect(onVerificado).not.toHaveBeenCalled();
  });

  it('con el código correcto entrega el leadId verificado', async () => {
    const user = userEvent.setup();
    const onVerificado = vi.fn();
    verifyMock.mockReturnValue(Promise.resolve({ ok: true as const, data: { leadId: 'lead-1' } }));
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={onVerificado} />);

    await user.type(await screen.findByLabelText(/Código de 6 dígitos/u), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar a mi camino' }));

    await waitFor(() => {
      expect(onVerificado).toHaveBeenCalledWith('lead-1');
    });
    expect(verifyMock).toHaveBeenCalledWith({ leadId: 'lead-1', codigo: '123456' });
  });

  it('si el envío falla muestra la causa del backend, no un genérico', async () => {
    // Fuera de producción el backend distingue "no existe esa cuenta" de "falló
    // el envío"; tragarse ese mensaje era lo que hacía parecer que el problema
    // era el SMTP cuando en realidad no se encontraba el lead.
    requestMock.mockReturnValue(
      Promise.resolve({
        ok: false as const,
        error: { code: 'NOT_FOUND', message: 'No existe un lead con ese contacto', fields: null },
      }),
    );
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/No existe un lead con ese contacto/u);
  });

  it('cae al mensaje genérico si el error no trae texto', async () => {
    requestMock.mockReturnValue(
      Promise.resolve({
        ok: false as const,
        error: { code: 'INTERNAL_ERROR', message: '', fields: null },
      }),
    );
    render(<LeadOtpGateScreen leadId="lead-1" onVerificado={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/No pudimos enviarte el código/u);
  });
});
