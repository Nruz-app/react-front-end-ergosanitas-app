import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LoginContext } from '../../common/context';
import type { IChequeo, ResumenColegio } from '../interface';
import { UseChequeoCardiovascularService } from '../services';
import { filtrarAlterados, resumirPorEdadSexo, resumirPorSaturacion } from '../utilities';

/**
 * Las derivaciones del Home, a partir de **una sola** llamada a `chequeo-all`.
 *
 * Es la diferencia deliberada con los cuatro gráficos del backend, que sí piden su serie cada
 * uno: allí cada gráfico consulta un endpoint distinto, aquí las derivadas salen del mismo
 * listado. Si cada una se pidiera lo suyo, serían varias descargas del histórico completo del
 * colegio para pintar la misma pantalla.
 *
 * Por eso el hook se usa **una vez, en `HomePage`**, y las series bajan por props: los cuatro
 * gráficos derivados son presentacionales y no llaman a ningún servicio.
 */
export const useResumenColegio = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [filas, setFilas] = useState<IChequeo[]>([]);
    const [cargado, setCargado] = useState(false);
    const [error, setError] = useState(false);

    const cargar = useCallback(async () => {

        try {
            setError(false);
            const { postChequeoAll } = await UseChequeoCardiovascularService();
            const response = await postChequeoAll(user_email);

            // Mismo blindaje que en los gráficos del backend: algunos endpoints responden 200
            // con un sobre de error en vez del listado, y sin esto el `.length` de las
            // agregaciones reventaría en el render.
            //
            // Un sobre de error es un servicio caído, no un colegio sin deportistas: por eso
            // marca `error` igual que lo haría un 500. Si aquí se guardara solo `[]`, las
            // cuatro tarjetas dirían «todavía no hay datos» y el fallo quedaría escondido.
            if (Array.isArray(response)) setFilas(response);
            else {
                setFilas([]);
                setError(true);
            }
        }
        catch (problema) {
            // Que la API falle y que el colegio no tenga datos tienen que verse distinto.
            console.error('Error al cargar el resumen del colegio:', problema);
            setFilas([]);
            setError(true);
        }
        finally {
            setCargado(true);
        }
    }, [user_email]);

    useEffect(() => { cargar(); }, [cargar]);

    // Sin memo, las derivaciones se recalcularían en cada render del Home.
    const resumen: ResumenColegio = useMemo(() => ({
        alterados   : filtrarAlterados(filas),
        porSaturacion : resumirPorSaturacion(filas),
        porEdadSexo : resumirPorEdadSexo(filas),
        totalFilas  : filas.length,
    }), [filas]);

    return { resumen, cargado, error };
};
