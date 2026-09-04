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
