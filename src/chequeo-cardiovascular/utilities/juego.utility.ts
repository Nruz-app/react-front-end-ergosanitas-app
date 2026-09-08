import type { IJuegoCarta } from '../interface';
import { capitalizarPalabras } from './chequeo.utility';

/**
 * Ayudantes del juego de cartas por nivel (Spec 04).
 *
 * Todos puros: la carta llega ya calculada por el backend y **aquí no se deriva ni un valor
 * clínico**. Lo que hay es presentación —iniciales, fecha, texto para el lector de pantalla— y
 * el filtrado en memoria de la grilla.
 */

/**
 * Las iniciales del alumno para el avatar de la carta.
 *
 * El HTML de referencia pone un emoji de persona por paciente (🧑 / 👩). Se descartó: sobre
 * nombres reales de menores eso es afirmar un género a partir de un campo que el propio backend
 * describe como muy desbalanceado. El `sexo` sí viaja y se muestra como texto, que es lo que el
 * dato dice.
 */
export const iniciales = (nombre: string): string => {

    const palabras = nombre.trim().split(/\s+/).filter(Boolean);

    if (palabras.length === 0) return '—';

    const primera = palabras[0]?.[0] ?? '';
    const segunda = palabras.length > 1 ? palabras[1]?.[0] ?? '' : '';

    return `${primera}${segunda}`.toUpperCase();
};

/**
 * La fecha de atención de una carta, en `DD-MM-YYYY`.
 *
 * ⚠️ **No se usa `parsearFecha` de `resumen.utility.ts`**: aquel espera el `DD-MM-YYYY` que
 * devuelve `chequeo-all`, y este endpoint entrega `YYYY-MM-DD HH:mm:ss.ffffff`. Son dos formatos
 * distintos en el mismo backend, así que cada uno lleva su lector. Se corta por el espacio en vez
 * de construir un `Date`, para no arrastrar la zona horaria del navegador a una fecha que ya
 * viene decidida.
 */
export const fechaDeCarta = (fecha: string | null): string => {

    if (!fecha) return '—';

    const [dia] = fecha.split(' ');
    const partes = dia?.split('-') ?? [];

    if (partes.length !== 3) return '—';

    const [anio, mes, numero] = partes;

    return `${numero}-${mes}-${anio}`;
};

/**
 * El resumen hablado de una carta, para el `aria-label` del elemento pulsable.
 *
 * Sin esto, un lector de pantalla anuncia «botón» y el nombre suelto: el nivel, el puntaje y el
 * progreso —lo único que la carta comunica— quedarían solo en el color y en las barras.
 *
 * El nombre va capitalizado igual que en la carta: el nombre accesible de un control tiene que
 * contener su texto visible, y el backend devuelve algunos nombres en mayúsculas.
 */
export const resumenDeCarta = (carta: IJuegoCarta): string => {

    const puntaje = carta.puntaje === null
        ? 'sin puntaje'
        : `puntaje ${carta.puntaje} de 100`;

    return `${capitalizarPalabras(carta.nombre)}. Nivel ${carta.nivel.nombre}, ${puntaje}, `
        + `${carta.estrellas} de 5 estrellas, ficha ${carta.estado.nombre} al ${carta.progreso}%. `
        + 'Abre el desglose.';
};

/**
 * Filtra la grilla en memoria: texto libre más los dos ejes, combinables.
 *
 * Va en el front y no en el `?search=` del servidor porque el club más grande son 147 cartas y
 * llegan en una sola respuesta: ir al servidor por cada tecla sería tráfico regalado.
 *
 * `''` en un slug significa «todos». La búsqueda mira **nombre y RUT**, que es por lo que un
 * colegio busca a alguien.
 */
export const filtrarCartas = (
    cartas      : IJuegoCarta[],
    texto       : string,
    slugNivel   : string,
    slugEstado  : string,
): IJuegoCarta[] => {

    const busqueda = texto.trim().toLowerCase();

    return cartas.filter((carta) => {

        if (slugNivel && carta.nivel.slug !== slugNivel) return false;
        if (slugEstado && carta.estado.slug !== slugEstado) return false;

        if (!busqueda) return true;

        return carta.nombre.toLowerCase().includes(busqueda)
            || carta.rut.toLowerCase().includes(busqueda);
    });
};
