import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import type { IChequeo } from '../interface';
import { UseChequeoAdministradorService } from '../services';

interface ChequeoRut {
    chequeo    : IChequeo | undefined;
    setChequeo : Dispatch<SetStateAction<IChequeo | undefined>>;
    /** `true` si la carga falló. Mientras `chequeo` es `undefined` y esto `false`, está cargando. */
    error      : boolean;
}

/**
 * Carga un chequeo por su id: puebla la edición y la cabecera de la revisión médica.
 *
 * Es el único fetch del chequeo individual; el `getChequeoCardiovascular` duplicado del módulo
 * viejo (mismo endpoint) no se clonó.
 *
 * A diferencia del original, captura el fallo (era una promesa rechazada sin manejar) y descarta
 * la respuesta si el id cambió mientras volaba, para no pintar la ficha de otro paciente.
 */
export const useChequeoRut = (id_paciente: number): ChequeoRut => {

    const [chequeo, setChequeo] = useState<IChequeo>();
    const [error, setError] = useState(false);

    useEffect(() => {

        if (!id_paciente) return;

        let vigente = true;

        const loadChequeo = async () => {

            try {
                setError(false);
                const { getChequeoRut } = await UseChequeoAdministradorService();
                const resChequeo: IChequeo = await getChequeoRut(id_paciente);

                if (vigente) setChequeo(resChequeo);
            }
            catch (problema) {
                console.error('Error al cargar el chequeo:', problema);
                if (vigente) setError(true);
            }
        };

        loadChequeo();

        return () => { vigente = false; };

    }, [id_paciente]);

    return { chequeo, setChequeo, error };
};
