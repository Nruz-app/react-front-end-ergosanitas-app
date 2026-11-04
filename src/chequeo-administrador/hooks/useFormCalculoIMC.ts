import { useEffect, useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { CalculadoraIMC } from '../interface';
import { calculadoraIMCValidationSchema, camposCalculadora, valoresPorDefectoDe } from '../utilities';

/**
 * Formulario de la calculadora IMC. La lógica clínica vive en `useCalculoIMC`, intacta.
 * Arranca con los `defaultValue` del JSON (sexo «Masculino»), como el original.
 */
export const useFormCalculoIMC = (calculadoraIMC?: CalculadoraIMC) => {

    const defaults = useMemo(
        () => valoresPorDefectoDe(camposCalculadora) as unknown as DefaultValues<CalculadoraIMC>,
        [],
    );

    const { control, reset, handleSubmit, setValue, getValues, formState: { errors } } = useForm<CalculadoraIMC>({
        resolver      : yupResolver(calculadoraIMCValidationSchema) as unknown as Resolver<CalculadoraIMC>,
        defaultValues : defaults,
        mode          : 'all',
        criteriaMode  : 'all',
    });

    useEffect(() => {

        reset(calculadoraIMC ?? defaults);

    }, [calculadoraIMC, reset, defaults]);

    return { control, reset, handleSubmit, setValue, getValues, errors };
};
