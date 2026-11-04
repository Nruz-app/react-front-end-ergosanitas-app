import { useEffect, useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { INuevoUsuario } from '../interface';
import { camposUsuario, usuarioValidationSchema, valoresPorDefectoDe } from '../utilities';

/**
 * Formulario de «Crear usuario», clonado de `src/User/hooks/use-user-form.ts`.
 *
 * Arranca con los `defaultValue` del JSON: en la práctica `perfil_user = "1"` (Administrador,
 * D5 a). Sin esto el desplegable saldría vacío.
 */
export const useUsuarioForm = (usuario?: INuevoUsuario) => {

    const defaults = useMemo(
        () => valoresPorDefectoDe(camposUsuario) as unknown as DefaultValues<INuevoUsuario>,
        [],
    );

    const { control, reset, handleSubmit, setValue, getValues, formState: { errors } } = useForm<INuevoUsuario>({
        resolver      : yupResolver(usuarioValidationSchema) as unknown as Resolver<INuevoUsuario>,
        defaultValues : defaults,
        mode          : 'all',
        criteriaMode  : 'all',
    });

    useEffect(() => {

        reset(usuario ?? defaults);

    }, [usuario, reset, defaults]);

    return { control, reset, handleSubmit, setValue, getValues, defaults, errors };
};
