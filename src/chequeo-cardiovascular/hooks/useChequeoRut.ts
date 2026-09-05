import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import type { IChequeo } from '../interface';
import { UseChequeoCardiovascularService } from '../services';

interface ChequeoRut {
    chequeo    : IChequeo | undefined;
    setChequeo : Dispatch<SetStateAction<IChequeo | undefined>>;
}

/** Carga un chequeo por su id para poblar el formulario de edición. */
export const useChequeoRut = (id_paciente: number): ChequeoRut => {

    const [chequeo, setChequeo] = useState<IChequeo>();

    const loadChequeo = useCallback(async (id: number) => {

        const { getChequeoRut } = await UseChequeoCardiovascularService();
        const resChequeo: IChequeo = await getChequeoRut(id);
        setChequeo(resChequeo);

    }, []);

    useEffect(() => {

        if (id_paciente) loadChequeo(id_paciente);

    }, [id_paciente, loadChequeo]);

    return { chequeo, setChequeo };
};
