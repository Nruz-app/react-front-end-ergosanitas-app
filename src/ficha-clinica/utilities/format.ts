/**
 * Helpers de presentación de fechas.
 *
 * `parse.ts` normaliza la entrada del backend; esto es la salida hacia la UI.
 */

/** Marca visual de dato ausente. Nunca se sustituye por 0. */
export const SIN_DATO = '—';

/** Valor numérico con su unidad, o '—' si el backend no entregó el dato. */
export const formatNumero = (valor: number | null, unidad?: string): string => {

    if (valor === null) return SIN_DATO;

    return unidad ? `${valor} ${unidad}` : `${valor}`;
};

/** Texto del backend, o '—' si viene vacío. */
export const formatTexto = (valor: string | null): string => valor ?? SIN_DATO;

/**
 * Combina sistólica y diastólica en '107/74'.
 *
 * Devuelve `null` solo si faltan las dos: con una sola cifra muestra '107/—',
 * porque media presión informa más que ninguna y deja claro cuál falta.
 */
export const formatPresion = (
    sistolica: number | null,
    diastolica: number | null,
): string | null => {

    if (sistolica === null && diastolica === null) return null;

    return `${sistolica ?? SIN_DATO}/${diastolica ?? SIN_DATO}`;
};

/** 'YYYY-MM-DD' → 'DD/MM/YYYY'. Devuelve '—' si la fecha viene vacía o inválida. */
export const formatFechaCL = (iso: string | null | undefined): string => {

    if (!iso) return SIN_DATO;

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!partes) return SIN_DATO;

    const [, anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
};
