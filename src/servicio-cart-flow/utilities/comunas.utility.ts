import type { IComuna } from '../interface';

/** Opción del selector: el nombre siempre está; `comuna` solo si el back la conoce (zona y cargos). */
export interface IOpcionComuna {
    nombre : string;
    comuna : IComuna | null;
}

/** El JSON del flujo anterior y el catálogo del back no escriben igual algunas comunas. */
const ALIAS: Record<string, string> = {
    'santiago': 'santiago centro',
};

/** Minúsculas, sin tildes y con los alias resueltos: la clave para cruzar las dos listas. */
export const normalizarComuna = (nombre: string): string => {

    const base = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLocaleLowerCase('es');

    return ALIAS[base] ?? base;
};

/**
 * Une la lista estática (`config/comunas-rm.json`, la del flujo anterior) con las comunas del back.
 * Así el selector siempre tiene opciones aunque la API falle, y suma las comunas fuera de RM que
 * solo conoce el back (para cotizar). Sin duplicados y en orden alfabético.
 */
export const opcionesComuna = (estaticas: { name: string }[], api: IComuna[]): IOpcionComuna[] => {

    const porClave = new Map<string, IOpcionComuna>();

    api.forEach((c) => porClave.set(normalizarComuna(c.comuna), { nombre: c.comuna, comuna: c }));

    estaticas.forEach(({ name }) => {
        const clave = normalizarComuna(name);
        if (!porClave.has(clave)) porClave.set(clave, { nombre: name, comuna: null });
    });

    return [...porClave.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
};
