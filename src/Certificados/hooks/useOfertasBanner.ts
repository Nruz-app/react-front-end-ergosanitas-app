import { useCallback, useEffect, useRef, useState } from 'react';

import { UseOfertasService } from '../services/useOfertasService';
import { precargarImagen, sortearIndice } from '../utilities';

import type { EstadoOfertas, IOfertaBanner } from '../interface';

interface InicialElegida {
    ofertas : IOfertaBanner[];
    indice  : number;
}

/**
 * Sortea una oferta y precarga su imagen (D3). Si la imagen falla, quita esa oferta de la lista y
 * sortea otra entre las que quedan. Nunca rechaza: sin ninguna imagen sana devuelve la lista vacía,
 * y la página usa el spinner.
 *
 * `idExcluida` evita repetir la oferta inicial de la búsqueda anterior. Va por `id` y no por
 * índice porque la lista puede encogerse entre un sorteo y otro.
 */
const elegirInicial = async (lista: IOfertaBanner[], idExcluida?: number): Promise<InicialElegida> => {

    let restantes = lista;

    while (restantes.length > 0) {

        const excluido = restantes.findIndex((oferta) => oferta.id === idExcluida);
        const indice = sortearIndice(restantes.length, excluido);

        try {
            await precargarImagen(restantes[indice].src);
            return { ofertas: restantes, indice };
        } catch (problema) {
            console.warn(
                'Certificados: una oferta del banner no tiene imagen; se quita de la rotación.',
                problema instanceof Error ? problema.message : problema,
            );
            restantes = restantes.filter((_, posicion) => posicion !== indice);
        }
    }

    return { ofertas: [], indice: 0 };
};

/**
 * Ofertas del banner que reemplaza al spinner mientras se busca un RUT (SPEC 02 de certificados).
 *
 * - Hace **una** petición a `home-imagenes` al montar la página (D1), no al buscar: si se pidieran
 *   al buscar, llegarían junto con los resultados y el banner no se vería nunca.
 * - Precarga **solo la oferta inicial** de la próxima búsqueda (Q1): las promociones pesan unos
 *   2 MB cada una y en una búsqueda normal se ve una sola. `estado` pasa a `listo` cuando esa
 *   imagen ya está en caché.
 * - `rotarInicial` sortea y precarga la inicial de la búsqueda siguiente (P4). Solo cambia
 *   `indiceInicial` cuando la imagen nueva ya cargó; hasta entonces vale la anterior, que ya está
 *   en caché.
 *
 * Sin aviso al visitante si falla: la página es de certificados y la publicidad es accesoria. El
 * motivo queda en consola.
 */
export const useOfertasBanner = (): {
    ofertas       : IOfertaBanner[];
    estado        : EstadoOfertas;
    /** Índice en `ofertas` con el que arranca la próxima búsqueda; su imagen ya está en caché. */
    indiceInicial : number;
    /** Sortea y precarga la oferta inicial de la búsqueda siguiente. */
    rotarInicial  : () => void;
} => {

    const [ofertas, setOfertas] = useState<IOfertaBanner[]>([]);
    const [estado, setEstado] = useState<EstadoOfertas>('cargando');
    const [indiceInicial, setIndiceInicial] = useState(0);

    // Lista e índice vigentes, para que `rotarInicial` los lea sin recrearse en cada cambio
    // (`rerender-use-ref-transient-values`).
    const actual = useRef<InicialElegida>({ ofertas: [], indice: 0 });
    const rotando = useRef(false);
    const montado = useRef(true);

    // Estable: solo toca refs y setters. Así el efecto de montaje no se repite por depender de él.
    const aplicar = useCallback((elegida: InicialElegida) => {
        actual.current = elegida;
        setOfertas(elegida.ofertas);
        setIndiceInicial(elegida.indice);
    }, []);

    useEffect(() => {

        montado.current = true;

        // `vigente` descarta la respuesta si la página se desmonta antes de que llegue. En
        // desarrollo, el StrictMode monta dos veces: la primera petición se descarta aquí, antes
        // de precargar nada.
        let vigente = true;

        const cargar = async () => {
            try {
                const { getOfertas } = await UseOfertasService();
                const lista = await getOfertas();

                if (!vigente) return;

                if (lista.length === 0) {
                    console.warn('Certificados: no hay ofertas «promocion» activas; la búsqueda usa el spinner.');
                }

                const elegida = await elegirInicial(lista);

                if (!vigente) return;

                aplicar(elegida);
                setEstado('listo');
            } catch (problema) {
                if (!vigente) return;

                console.warn(
                    'Certificados: no se pudieron cargar las ofertas del banner.',
                    problema instanceof Error ? problema.message : problema,
                );
                setEstado('error');
            }
        };

        cargar();

        return () => {
            vigente = false;
            montado.current = false;
        };

    }, [aplicar]);

    const rotarInicial = useCallback(() => {

        const { ofertas: lista, indice } = actual.current;

        if (lista.length < 2 || rotando.current) return;

        rotando.current = true;

        elegirInicial(lista, lista[indice]?.id).then((elegida) => {
            rotando.current = false;

            if (montado.current) aplicar(elegida);
        });

    }, [aplicar]);

    return { ofertas, estado, indiceInicial, rotarInicial };
};
