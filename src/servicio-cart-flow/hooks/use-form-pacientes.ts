import { useCallback, useState } from 'react';
import { ValidationError } from 'yup';

import type { IPacienteCarro, IPacienteForm } from '../interface';
import { normalizarRut, PACIENTE_VACIO, pacienteSchema } from '../utilities';

type Errores = Record<number, Partial<Record<keyof IPacienteForm, string>>>;

const desdeCarro = (p: IPacienteCarro): IPacienteForm => ({
    ...PACIENTE_VACIO,
    nombre: p.nombre ?? '',
    rut: p.rut ?? '',
    fecha_nac: p.fecha_nac ?? '',
    sexo: p.sexo ?? '',
    prevision: p.prevision ?? '',
    telefono: p.telefono ?? '',
    email: p.email ?? '',
    consentimiento: p.consentimiento,
    apoderado_nombre: p.apoderado_nombre ?? '',
    apoderado_rut: p.apoderado_rut ?? '',
    consentimiento_apoderado: p.consentimiento_apoderado,
});

/**
 * Formularios de todos los pacientes del carro a la vez, validados con yup campo a campo
 * (`abortEarly: false`). Arranca con lo que el back ya tiene guardado.
 */
export const useFormPacientes = (pacientes: IPacienteCarro[]) => {

    const [valores, setValores] = useState<Record<number, IPacienteForm>>(
        () => Object.fromEntries(pacientes.map((p) => [p.id, desdeCarro(p)])),
    );
    const [errores, setErrores] = useState<Errores>({});

    const cambiar = useCallback(<K extends keyof IPacienteForm>(id: number, campo: K, valor: IPacienteForm[K]) => {
        setValores((previo) => ({ ...previo, [id]: { ...(previo[id] ?? PACIENTE_VACIO), [campo]: valor } }));
        setErrores((previo) => ({ ...previo, [id]: { ...previo[id], [campo]: undefined } }));
    }, []);

    /** Devuelve los valores normalizados si todos son válidos, o null y deja los errores a la vista. */
    const validar = useCallback(async (): Promise<Record<number, IPacienteForm> | null> => {

        const nuevos: Errores = {};
        const limpios: Record<number, IPacienteForm> = {};

        for (const p of pacientes) {
            const form = valores[p.id] ?? PACIENTE_VACIO;

            try {
                await pacienteSchema.validate(form, { abortEarly: false });
                limpios[p.id] = { ...form, rut: normalizarRut(form.rut), apoderado_rut: normalizarRut(form.apoderado_rut) };
            }
            catch (problema) {
                if (problema instanceof ValidationError) {
                    nuevos[p.id] = Object.fromEntries(problema.inner.map((e) => [e.path, e.message]));
                }
            }
        }

        setErrores(nuevos);

        return Object.keys(nuevos).length === 0 ? limpios : null;
    }, [pacientes, valores]);

    return { valores, errores, cambiar, validar };
};
