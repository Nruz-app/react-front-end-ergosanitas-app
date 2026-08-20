import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IFichaClinica, IFichaClinicaResponse } from '../interface';
import { mapFichaClinica } from '../utilities';
import fichaJson from '../data/paciente.json';

/**
 * Servicio del módulo Paciente.
 *
 * El endpoint real es `GET {VITE_API}{VITE_API_PATH}/ficha-clinica/{rut}` y ya responde
 * en el backend local.
 *
 * ⚠️ `data/paciente.json` NO es la respuesta de un solo RUT: es un compuesto armado a
 * mano para poder desarrollar los cuatro tabs a la vez. Verificado contra el backend:
 *
 *   /ficha-clinica/16900918-k → paciente con nombre/sexo/fechaNacimiento en `null`,
 *                               bioimpedancias: array(1), electrocardiogramas: `null`
 *   /ficha-clinica/2123456-7  → paciente completo,
 *                               bioimpedancias: `null`, electrocardiogramas: array(6)
 *   RUT inexistente           → HTTP 500 con `{success:false, message:"…"}`
 *
 * Ningún RUT real devuelve los dos tipos de examen juntos, y las listas llegan `null`,
 * no `[]`. El mapper y las interfaces cubren las tres formas; el mock solo sirve para
 * tener las cuatro vistas pobladas mientras se construye la UI.
 *
 * Mientras `USAR_MOCK` esté en `true` se resuelve el JSON local con una latencia
 * artificial; con `false` sale la petición HTTP. Los DOS caminos son código real y
 * `tsc -b` los type-checkea: por eso la llamada no está comentada. Un comentario no
 * compila, y el que había aquí llevaba la ruta equivocada sin que nadie se enterara.
 */
export const UsePacienteService = () => {

    /** Único cambio necesario para conectar el backend real. */
    const USAR_MOCK = false;

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    // Latencia simulada (ms) para imitar una petición de red.
    const LATENCIA_MS = 600;

    const esperar = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

    /**
     * Comprueba el sobre de la respuesta antes de mapear.
     *
     * `mapFichaClinica` entra directo a `data.ficha_clinica`: sin esta guarda, un
     * `success: false` o un cambio de envoltorio se manifiestan como
     * «Cannot read properties of undefined» a mitad del mapper, que no le dice nada a
     * nadie. La página convierte este Error en su estado de error.
     */
    const validarRespuesta = (respuesta: IFichaClinicaResponse): IFichaClinicaResponse => {

        if (!respuesta?.data?.ficha_clinica) {
            throw new Error(
                respuesta?.message || 'La respuesta del servidor no trae la ficha clínica.',
            );
        }

        return respuesta;
    };

    /**
     * Mensaje legible a partir de lo que sea que haya fallado.
     *
     * En un 500 axios lanza «Request failed with status code 500» y se traga el cuerpo de
     * la respuesta, donde el backend sí explica qué pasó (`{"success":false,
     * "message":"Error procesando IA"}`). Ese mensaje es el que se muestra.
     */
    const mensajeDeError = (problema: unknown): string => {

        const cuerpo = (problema as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;

        if (cuerpo) return cuerpo;

        return problema instanceof Error
            ? problema.message
            : 'No hay respuesta del servidor.';
    };

    /**
     * Ficha clínica de un paciente, ya normalizada al modelo de UI.
     *
     * El `rut` va en la ruta: la API entrega la ficha de una persona a la vez.
     */
    const getFichaClinica = async (rut: string): Promise<IFichaClinica> => {

        if (USAR_MOCK) {
            await esperar(LATENCIA_MS);

            // El `as` es directo a propósito (nunca `as unknown as`): así TypeScript sigue
            // exigiendo solapamiento entre el JSON y la interfaz, y una divergencia entre
            // mock y contrato aparece como error de compilación.
            return mapFichaClinica(validarRespuesta(fichaJson as IFichaClinicaResponse));
        }

        try {
            // `get` con limit/offset es el patrón del repo para un GET por RUT: mismo caso
            // en `Certificados/services/useCertificadoService.ts`. El endpoint los ignora.
            const respuesta = await apiAdapter.get<IFichaClinicaResponse>(
                `${API}/ficha-clinica/${rut}`, 10, 0,
            );

            return mapFichaClinica(validarRespuesta(respuesta));

        } catch (problema) {
            throw new Error(mensajeDeError(problema));
        }
    };

    return {
        getFichaClinica,
    };
};
