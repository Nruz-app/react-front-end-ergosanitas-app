import { useEffect, useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { IElectroCardiograma } from '../interface';
import { camposElectro, electroCardiogramaValidationSchema, valoresPorDefectoDe } from '../utilities';

/**
 * Formulario de la revisión médica (ECG). Expone `getValues` en lugar de `_formValues`, y
 * arranca con los `defaultValue` del JSON (hoy todos vacíos).
 */
export const useElectroCardiograma = (electroCardiograma?: IElectroCardiograma) => {

    const defaults = useMemo(
        () => valoresPorDefectoDe(camposElectro) as unknown as DefaultValues<IElectroCardiograma>,
        [],
    );

    const { control, reset, handleSubmit, setValue, getValues, formState: { errors } } = useForm<IElectroCardiograma>({
        resolver      : yupResolver(electroCardiogramaValidationSchema) as unknown as Resolver<IElectroCardiograma>,
        defaultValues : defaults,
        mode          : 'all',
        criteriaMode  : 'all',
    });

    useEffect(() => {

        reset(electroCardiograma ?? defaults);

    }, [electroCardiograma, reset, defaults]);

    return { control, reset, handleSubmit, setValue, getValues, defaults, errors };
};
