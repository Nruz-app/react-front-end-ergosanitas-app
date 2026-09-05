/**
 * Series que el Home calcula **en el front** a partir de `chequeo-all`.
 *
 * No son datos del backend: son agregaciones de las filas que el módulo ya descarga para
 * exportar a Excel. Por eso cada serie declara `usadas`: el colegio tiene que poder ver sobre
 * cuántos deportistas está calculado lo que mira, sobre todo cuando no cuadre con los
 * contadores de `estado-general`, que sí vienen del backend.
 */

import type { IChequeo } from './chequeo.interface';

/** Serie de una dimensión: etiqueta → valor, con su color. */
export interface SerieSimple {
    labels  : string[];
    data    : number[];
    colores : string[];
    /** Filas que entraron en el cálculo. Puede ser menor que el total descargado. */
    usadas  : number;
}

/** Una pila de una serie apilada. */
export interface PilaSerie {
    nombre : string;
    data   : number[];
    color  : string;
}

/** Serie apilada: varias pilas sobre las mismas etiquetas. */
export interface SerieApilada {
    labels : string[];
    pilas  : PilaSerie[];
    usadas : number;
}

/** Lo que devuelve `useResumenColegio`, ya derivado. */
export interface ResumenColegio {
    /** Los deportistas con diagnóstico alterado, del más reciente al más antiguo. */
    alterados   : IChequeo[];
    /** Distribución de saturación de oxígeno, derivada de `saturacionOxigeno`. */
    porSaturacion : SerieSimple;
    /** Pirámide por rango etario y sexo. */
    porEdadSexo : SerieApilada;
    /** Filas descargadas. Es el denominador contra el que se leen los `usadas` de cada serie. */
    totalFilas  : number;
}

/**
 * Los cuatro estados en los que puede estar una tarjeta de gráfico.
 *
 * `sin-datos` y `no-disponible` son distintos a propósito: el primero dice que el colegio
 * todavía no tiene mediciones, el segundo que el servicio falló. Confundirlos esconde un fallo
 * real —hoy `estadistica-saturacion` devuelve 500— y nadie se entera de arreglarlo.
 */
export type EstadoTarjeta = 'cargando' | 'sin-datos' | 'no-disponible' | 'ok';
