import { useEffect, useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { IChequeo } from '../interface';
import { chequeoValidationSchema, valoresPorDefecto } from '../utilities';

/**
 * Formulario de alta y edición del chequeo.
 *
 * El esquema aplica D4 (b): identificación obligatoria, el resto solo en formato si viene
 * relleno. Se arma desde el JSON, así que su tipo inferido no coincide con `IChequeo`: se acota
 * el cast al resolver en vez de tipar el formulario como `any`, como hacía el módulo original.
 *
 * En alta se resetea a los valores por defecto del JSON, no a un objeto vacío: los `Controller`
 * pintan su `defaultValue` pero no lo escriben en el estado.
 *
 * Se expone `getValues` para que `InputText` lea el resto del formulario al recalcular el IMC
 * **sin tocar `control._formValues`**, que es API privada de react-hook-form (§7.1).
 */
export const useChequeo = (chequeo?: IChequeo) => {

    const defaults = useMemo(() => valoresPorDefecto() as DefaultValues<IChequeo>, []);

    const { control, reset, handleSubmit, setValue, getValues, formState: { errors } } = useForm<IChequeo>({
        resolver      : yupResolver(chequeoValidationSchema) as unknown as Resolver<IChequeo>,
        defaultValues : defaults,
        mode          : 'all',
        criteriaMode  : 'all',
    });

    useEffect(() => {

        reset(chequeo ?? defaults);

    }, [chequeo, reset, defaults]);

    return { control, reset, handleSubmit, setValue, getValues, defaults, errors };
};
