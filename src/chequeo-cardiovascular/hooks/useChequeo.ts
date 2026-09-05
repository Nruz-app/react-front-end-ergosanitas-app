import { useEffect, useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { IChequeo } from '../interface';
import { buildChequeoValidationSchema, valoresPorDefecto } from '../utilities';

/**
 * Formulario de alta y edición.
 *
 * Recibe **los campos visibles** para que el esquema valide solo lo que el usuario puede ver
 * (ver `buildChequeoValidationSchema`). El esquema se arma desde el JSON, así que su tipo
 * inferido no coincide con `IChequeo`: se acota el cast al resolver en vez de tipar el
 * formulario como `any`, que es lo que hacía el módulo original.
 *
 * En alta se resetea a los valores por defecto del JSON, no a un objeto vacío: los `Controller`
 * pintan su `defaultValue` pero no lo escriben en el estado, así que un reset vacío dejaba los
 * desplegables *pareciendo* rellenos y fallando la validación.
 *
 * Se expone `getValues` para que `InputText` pueda leer el resto del formulario al recalcular
 * el IMC **sin tocar `control._formValues`**, que es API privada de react-hook-form.
 */
export const useChequeo = (camposVisibles: string[], chequeo?: IChequeo) => {

    // Sin memo el esquema se reconstruye en cada render y react-hook-form revalida de más.
    const schema = useMemo(
        () => buildChequeoValidationSchema(camposVisibles),
        [camposVisibles],
    );

    const defaults = useMemo(() => valoresPorDefecto() as DefaultValues<IChequeo>, []);

    const { control, reset, handleSubmit, setValue, getValues, formState: { errors } } = useForm<IChequeo>({
        resolver      : yupResolver(schema) as unknown as Resolver<IChequeo>,
        defaultValues : defaults,
        mode          : 'all',
        criteriaMode  : 'all',
    });

    useEffect(() => {

        reset(chequeo ?? defaults);

    }, [chequeo, reset, defaults]);

    return { control, reset, handleSubmit, setValue, getValues, defaults, errors };
};
