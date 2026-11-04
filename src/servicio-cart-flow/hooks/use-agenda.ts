import { useEffect, useState } from 'react';

import type { IAgenda } from '../interface';
import { UseCartFlowService } from '../services';

type Estado = 'cargando' | 'listo' | 'error';

/** Bloques disponibles del carro. Se recarga al entrar al paso (los cupos cambian). */
export const useAgenda = (uuid: string) => {

    const [agenda, setAgenda] = useState<IAgenda | null>(null);
    const [estado, setEstado] = useState<Estado>('cargando');
    const [mensaje, setMensaje] = useState<string>('');

    useEffect(() => {

        let vigente = true;

        const cargar = async () => {
            setEstado('cargando');

            try {
                const datos = await (await UseCartFlowService()).getBloques(uuid);
                if (!vigente) return;
                setAgenda(datos);
                setEstado('listo');
            }
            catch (problema) {
                if (!vigente) return;
                setMensaje(problema instanceof Error ? problema.message : 'No se pudo cargar la agenda');
                setEstado('error');
            }
        };

        cargar();

        return () => { vigente = false; };
    }, [uuid]);

    return { agenda, estado, mensaje };
};
