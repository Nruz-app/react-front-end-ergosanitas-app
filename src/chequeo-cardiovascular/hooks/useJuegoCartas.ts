import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { LoginContext } from '../../common/context';
import type { IConfiguracionJuego, IJuegoCarta } from '../interface';
import { UseJuegoCartasService } from '../services';

/**
 * Carga el tab «Nivel de alumnos»: las cartas del club y la configuración de los dos ejes.
 *
 * **Dos llamadas en paralelo, una sola vez.** Se necesitan las dos para pintar una carta: la
 * carta trae `slug`, `valor` y `medido` de cada atributo, pero el icono y el nombre viven en el
 * catálogo de `/niveles`. Pedirlas en secuencia solo sumaría latencia.
 *
 * El filtrado y la búsqueda **no están aquí**: se hacen en la página, en memoria, sobre estas
 * mismas cartas. Con 147 como máximo, ir al servidor por cada tecla sería tráfico regalado.
 *
 * @param activo `true` cuando el tab está a la vista. **No es un adorno:** `TabPanel` oculta los
 * paneles con `display: none` en vez de desmontarlos, así que sin esta señal las 118 cartas se
 * pedirían y se montarían nada más entrar el colegio al módulo, aunque nunca abriera la
 * pestaña — justo el coste que el render incremental de la grilla existe para evitar. Es la
 * misma señal que usa `AsistentePage` para el micrófono.
 */
export const useJuegoCartas = (activo = true) => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [cartas, setCartas] = useState<IJuegoCarta[]>([]);
    const [configuracion, setConfiguracion] = useState<IConfiguracionJuego | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    /** El colegio para el que ya se pidieron los datos, para no repetir la carga en cada vuelta al tab. */
    const pedidoPara = useRef<string | null>(null);

    const cargar = useCallback(async () => {

        // Sin la clave de multi-tenencia no hay nada que pedir, y el endpoint devolvería las
        // cartas de un club vacío o un 404. La pantalla lo explica en vez de llamar.
        if (!user_email) {
            setCargando(false);
            return;
        }

        try {
            setCargando(true);
            setError(false);

            const { getCartasClub, getNiveles } = UseJuegoCartasService();

            const [listado, config] = await Promise.all([
                getCartasClub(user_email),
                getNiveles(),
            ]);

            setCartas(listado.cartas);
            setConfiguracion(config);
        }
        catch (problema) {
            // Que el servicio falle y que el colegio no tenga alumnos evaluados tienen que
            // verse distinto: el SP `SP_juego_cartas_club` puede no estar desplegado, y
            // entonces los tres endpoints dan 500. Confundirlo con «sin datos» escondería eso.
            console.error('Error al cargar el juego de cartas:', problema);
            setCartas([]);
            setConfiguracion(null);
            setError(true);
        }
        finally {
            setCargando(false);
        }
    }, [user_email]);

    // Se carga en la **primera** activación del tab, no en cada vuelta: los datos de una carta
    // cambian cuando alguien registra un chequeo, no mientras se navega entre pestañas. Para
    // refrescar a mano está «Reintentar», que llama a `cargar` sin pasar por aquí.
    useEffect(() => {

        if (!activo || pedidoPara.current === user_email) return;

        pedidoPara.current = user_email;
        cargar();
    }, [activo, user_email, cargar]);

    return {
        cartas,
        configuracion,
        cargando,
        error,
        sinEmail : !user_email,
        recargar : cargar,
    };
};
