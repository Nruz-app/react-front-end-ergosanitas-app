import { useEffect, useState } from 'react';

import { UseHomeImagenesService } from '../services';

import type { IHomeImagenApi, IImagenHome, IPromocionHome } from '../interface';

/** Estado de la carga de imágenes. `error` y `listo` sin imágenes ocultan la sección. */
export type EstadoImagenesHome = 'cargando' | 'listo' | 'error';

export interface IImagenesHome {
    promociones : IPromocionHome[];
    alianzas    : IPromocionHome[];
    galeria     : IImagenHome[];
    estado      : EstadoImagenesHome;
}

/** Traduce una fila del back a la forma que ya pintaban los componentes. */
const aImagen = (fila: IHomeImagenApi): IImagenHome => ({
    id      : String(fila.id),
    src     : fila.src,
    alt     : fila.alt,
    caption : fila.caption ?? '',
    activo  : fila.activo,
});

/**
 * Reparte las filas por `seccion`, comparando contra cada literal.
 *
 * `destacado` se deriva de la sección (`promocion` → `true`, `alianza` → `false`) para que
 * `CarruselPromociones` no cambie. Una sección desconocida **se descarta**: no cae en un grupo
 * por defecto, igual que antes una promoción sin `destacado` no caía entre las alianzas.
 *
 * No se reordena: el back ya entrega el orden que decidió el Administrador.
 */
const repartir = (filas: IHomeImagenApi[]): Omit<IImagenesHome, 'estado'> => {

    const promociones: IPromocionHome[] = [];
    const alianzas: IPromocionHome[] = [];
    const galeria: IImagenHome[] = [];

    for (const fila of filas) {
        if (fila.seccion === 'promocion') promociones.push({ ...aImagen(fila), destacado: true });
        else if (fila.seccion === 'alianza') alianzas.push({ ...aImagen(fila), destacado: false });
        else if (fila.seccion === 'galeria') galeria.push(aImagen(fila));
    }

    return { promociones, alianzas, galeria };
};

const VACIO: Omit<IImagenesHome, 'estado'> = { promociones: [], alianzas: [], galeria: [] };

/**
 * Imágenes del Home (Spec 04): **una** petición por visita, repartida en tres grupos.
 *
 * Lo llama solo `HomeErgoPage`, que pasa cada grupo por props. Si cada sección hiciera su
 * propio fetch serían tres peticiones al mismo endpoint.
 *
 * La bandera `vigente` descarta la respuesta si la página se desmonta antes de que llegue.
 * Sin respaldo JSON por decisión del usuario: si la API falla, `estado` queda en `error` y las
 * secciones no se pintan.
 */
export const useImagenesHome = (): IImagenesHome => {

    const [grupos, setGrupos] = useState<Omit<IImagenesHome, 'estado'>>(VACIO);
    const [estado, setEstado] = useState<EstadoImagenesHome>('cargando');

    useEffect(() => {

        let vigente = true;

        const cargar = async () => {
            try {
                const { getImagenesHome } = UseHomeImagenesService();
                const filas = await getImagenesHome();

                if (!vigente) return;

                const repartidas = repartir(filas);

                // Una sección sin imágenes no se pinta: se deja el motivo en consola para que
                // no parezca un fallo del Home.
                for (const [seccion, lista] of Object.entries(repartidas)) {
                    if (lista.length === 0) console.warn(`Home: la sección «${seccion}» no tiene imágenes activas; no se muestra.`);
                }

                setGrupos(repartidas);
                setEstado('listo');
            }
            catch (problema) {
                if (!vigente) return;

                // Sin aviso al visitante: el Home es comercial. Solo queda el rastro en consola.
                console.warn(
                    'Home: no se pudieron cargar las imágenes.',
                    problema instanceof Error ? problema.message : problema,
                );
                setEstado('error');
            }
        };

        cargar();

        return () => { vigente = false; };

    }, []);

    return { ...grupos, estado };
};
