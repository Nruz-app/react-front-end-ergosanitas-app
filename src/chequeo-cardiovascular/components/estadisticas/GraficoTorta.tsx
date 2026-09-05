import { useCallback, useContext, useEffect, useState } from 'react';

import { LoginContext } from '../../../common/context';
import type { IEstadistica } from '../../interface';
import { colorClinico, estadoDeTarjeta } from '../../utilities';

import { Dona } from './Dona';

const SIN_DATOS: IEstadistica = { labels: [], data: [], totalExamen: 0 };

interface Props {
    titulo   : string;
    etiqueta : string;
    /** Trae la serie del backend para el `user_email` del colegio. */
    fetchSerie : (user_email: string) => Promise<IEstadistica>;
}

/**
 * Base de los gráficos clínicos que **vienen del backend** (IMC, hemoglucotest).
 *
 * Se ocupa de traer la serie y de decidir el color; la dona, la leyenda y la tabla accesible las
 * pinta `Dona`, que comparte con los gráficos derivados de `chequeo-all`.
 *
 * Los colores los asigna `colorClinico` **por el texto de la etiqueta**, nunca por su posición.
 * Esa distinción no es cosmética: el backend no devuelve las series ordenadas de normal a
 * alterado —`estadistica-imc` empieza por «Bajo Peso»—, así que colorear por índice pintaba de
 * verde justo las categorías alteradas.
 */
export const GraficoTorta = ({ titulo, etiqueta, fetchSerie }: Props) => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [serie, setSerie] = useState<IEstadistica>(SIN_DATOS);
    const [cargado, setCargado] = useState(false);
    const [error, setError] = useState(false);

    const cargar = useCallback(async () => {

        try {
            setError(false);
            const response = await fetchSerie(user_email);

            // El backend puede responder 200 con un sobre de error en vez de la serie
            // (`{response: {status: 'Error en ejecucion', ...}}`). Sin esta comprobación,
            // `serie.data.length` reventaría en el render y tumbaría el Home entero por un
            // solo gráfico caído. Un sobre de error es un servicio caído, no un colegio
            // sin datos: por eso marca `error` y no simplemente vacío.
            if (Array.isArray(response?.data)) setSerie(response);
            else {
                setSerie(SIN_DATOS);
                setError(true);
            }
        }
        catch (problema) {
            // Que la API falle no debe dejar el Home en blanco: el resto de tarjetas sigue viva.
            console.error(`Error al cargar «${titulo}»:`, problema);
            setSerie(SIN_DATOS);
            setError(true);
        }
        finally {
            setCargado(true);
        }
    }, [fetchSerie, user_email, titulo]);

    useEffect(() => { cargar(); }, [cargar]);

    const hayDatos = serie.data.length > 0 && serie.data.some((valor) => valor > 0);

    return (
        <Dona
            titulo={titulo}
            subtitulo={serie.totalExamen > 0 ? `${serie.totalExamen} exámenes` : 'Sin exámenes registrados'}
            etiqueta={etiqueta}
            estado={estadoDeTarjeta(cargado, error, hayDatos)}
            labels={serie.labels}
            data={serie.data}
            colores={serie.labels.map((etiquetaSerie) => colorClinico(etiquetaSerie))}
        />
    );
};
