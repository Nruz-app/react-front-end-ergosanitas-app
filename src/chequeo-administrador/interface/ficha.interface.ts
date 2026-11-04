/**
 * Las tres navegaciones del tab «Ficha del chequeo» (§3.4).
 *
 * Reemplaza al `status` numérico del módulo viejo (`0` alta · `1` edición · `3` ECG; no existía
 * `2`). Es solo navegación de React: **no viaja al backend** y no tiene nada que ver con
 * `estado_paciente`, que sí es un dato clínico.
 *
 * La spec los dibuja en `pages/FichaChequeoPage.tsx`; viven aquí porque una página que exporta
 * algo más que componentes rompe el Fast Refresh (`react-refresh/only-export-components`).
 */
export type ModoFicha = 'alta' | 'edicion' | 'revision';

/** Qué muestra la ficha. El orquestador la guarda y la cambia desde la lista. */
export interface SeleccionFicha {
    modo         : ModoFicha;
    rut_paciente : string;
    id_paciente  : number;
    /** URL del certificado ya emitido; `''` si no hay. */
    url_pdf      : string;
}
