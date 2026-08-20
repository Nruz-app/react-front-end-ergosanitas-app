/**
 * Paleta de la distribución segmentaria.
 *
 * Un color por estado clínico, más su variante clara para el centro de los gradientes
 * radiales. El relleno de cada región usa el gradiente y el contorno el color pleno:
 * pintar la silueta con el color saturado a plano la convierte en una mancha y hace
 * ilegible cualquier cifra encima.
 *
 * `sinDato` es gris a propósito. La ausencia de medición no es un resultado normal y
 * no puede pintarse de verde.
 */

import { EstadoClinico } from '../../interface';

/** Orden de severidad, de peor a mejor. Lo usa la leyenda. */
export const ESTADOS: EstadoClinico[] = ['critico', 'alto', 'normal', 'bajo', 'sinDato'];

/** Color pleno: contorno de la región, punto del callout y texto de la etiqueta. */
export const COLOR_ESTADO: Record<EstadoClinico, string> = {
    critico : '#d32f2f',
    alto    : '#f57c00',
    normal  : '#2e7d32',
    bajo    : '#0288d1',
    sinDato : '#bdbdbd',
};

/** Variante clara: centro del gradiente radial, para dar volumen a la figura. */
export const COLOR_ESTADO_CLARO: Record<EstadoClinico, string> = {
    critico : '#ef9a9a',
    alto    : '#ffcc80',
    normal  : '#a5d6a7',
    bajo    : '#81d4fa',
    sinDato : '#eceff1',
};

/** Etiqueta legible. Va en los callouts y en la leyenda, junto al punto de color. */
export const ETIQUETA_ESTADO: Record<EstadoClinico, string> = {
    critico : 'Crítico',
    alto    : 'Alto',
    normal  : 'Normal',
    bajo    : 'Bajo',
    sinDato : 'Sin dato',
};

/**
 * Identificadores de los `<defs>` del SVG.
 *
 * Son constantes de módulo y no aceptan prefijo: la vista monta una sola silueta. Si
 * alguna vez se renderizan dos en la misma página habrá que parametrizarlos, porque
 * los `id` de SVG son globales al documento.
 */
export const idGradiente = (estado: EstadoClinico): string => `seg-grad-${estado}`;
export const ID_SOMBRA = 'seg-sombra';
export const ID_BRILLO = 'seg-brillo';
