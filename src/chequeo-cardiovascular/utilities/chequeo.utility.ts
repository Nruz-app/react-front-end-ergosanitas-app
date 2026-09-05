import dayjs from 'dayjs';
import type { ChipProps } from '@mui/material';

/** «JUAN PEREZ GONZALEZ» → «Juan Perez Gonzalez». */
export const capitalizarPalabras = (texto: string): string => {

    return texto
        .toLowerCase()
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
};

/**
 * ¿Este campo trae un dato que mostrar?
 *
 * Tres formas de «vacío» conviven en la misma respuesta del backend, comprobado contra
 * `chequeo-all` de `brisas@ergosanitas.com`: `null` (presión, saturación e IMC),
 * cadena vacía, y el **centinela `'-'`** con el que llega `frecuencia_cardiaca_paciente`
 * cuando todavía no se ha medido.
 *
 * ⚠️ Un `0` **sí es dato**: en un signo vital es una medición, no una ausencia. Por eso el
 * número se acepta siempre y solo se inspecciona el texto.
 */
export const hayDato = (valor?: string | number | null): boolean => {

    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'number') return true;

    const texto = valor.trim();

    return texto !== '' && texto !== '-';
};

/**
 * El valor tal cual, o «—» si no hay dato.
 *
 * Vive aquí y no en cada componente porque la lista de alterados lo pinta en dos formatos
 * —tabla en escritorio, tarjeta bajo 900 px— y con una copia en cada uno acabarían discrepando
 * a la primera modificación.
 */
export const oGuion = (valor?: string | number | null): string | number =>
    hayDato(valor) ? valor! : '—';

/**
 * «125/58» a partir de la sistólica y la diastólica.
 *
 * Si falta **una** de las dos se conserva la que sí se midió y el hueco se marca: «125/—». Una
 * versión anterior devolvía `null` en ese caso, con el argumento de que media presión no es una
 * presión — pero eso **borra de la pantalla una medición real**, que es peor que mostrarla
 * incompleta. El `—` es el mismo marcador de ausencia que usa todo el módulo, así que nadie
 * puede confundir «125/—» con un examen completo.
 *
 * Solo devuelve `null` cuando no hay ninguna de las dos: ahí no hay nada que conservar.
 */
export const formatearPresion = (
    sistolica?  : string | number | null,
    diastolica? : string | number | null,
): string | null => {

    if (!hayDato(sistolica) && !hayDato(diastolica)) return null;

    return `${oGuion(sistolica)}/${oGuion(diastolica)}`;
};

/**
 * Color del chip por estado clínico.
 *
 * Son **strings literales del backend**, con sus espacios y puntos: un typo no rompe nada,
 * simplemente cae en `default` y el estado pierde su color sin avisar.
 */
export const getEstadoProps = (estado: string): { label: string; color: ChipProps['color'] } => {

    if (!estado) return { label: '—', color: 'default' };

    switch (estado) {
        case 'ingresado'             : return { label: estado, color: 'default' };
        case 'Testiado'              : return { label: estado, color: 'primary' };
        case 'ECG FOTO'              : return { label: estado, color: 'secondary' };
        case 'REVISION MEDICA'       : return { label: estado, color: 'info' };
        case 'En Rev. Cardio'        : return { label: estado, color: 'info' };
        case 'Diag. Card. - Normal'  : return { label: estado, color: 'success' };
        case 'Diag. Card. - Alterado': return { label: estado, color: 'error' };
        default                      : return { label: estado, color: 'default' };
    }
};

/**
 * Marca como «reciente» solo lo que está en `ECG FOTO` de los últimos `dias` días.
 * Es lo que la lista destaca con un indicador lateral.
 */
export const esReciente = (
    fecha  : string | undefined,
    estado : string | undefined,
    dias   : number = 3,
): boolean => {

    if (!fecha || !estado) return false;
    if (estado !== 'ECG FOTO') return false;

    return dayjs().diff(dayjs(fecha), 'day') <= dias;
};
