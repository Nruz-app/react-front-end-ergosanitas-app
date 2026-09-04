import { useContext, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Swal from 'sweetalert2';

import { LoginContext } from '../../common/context';
import { SECCIONES_FORMULARIO } from '../config/secciones';
import { useChequeo } from '../hooks';
import type { ICampoFormulario, IChequeo } from '../interface';
import { UseChequeoCardiovascularService } from '../services';
import { camposFormulario } from '../utilities';

import { ButtonsForm, InputSelect, InputText } from './forms';
import { DatePickers } from './date-pickers/DatePickers';
import { SeccionCampos } from './SeccionCampos';

interface Props {
    chequeo?           : IChequeo;
    handleUpdateStatus : (status: number, rut_paciente: string, id_paciente: number) => void;
    handleReloadTable  : () => void;
}

/**
 * Alta y edición del deportista.
 *
 * Recorre `custom-form.json` **agrupado por `seccion`** en vez de la grilla plana del módulo
 * original. La regla de ocultamiento se conserva idéntica: un campo `disabledText: true` no se
 * renderiza para `Colegios`, y `rut`/`user_email`/`status`/`fecha_atencion` quedan fuera para
 * todo perfil que no sea `Administrador`. Como cuatro de las cinco secciones quedan sin campos
 * visibles, `SeccionCampos` no las pinta y `Colegios` ve solo «Identificación».
 */
export const ChequeoForm = ({ chequeo, handleUpdateStatus, handleReloadTable }: Props) => {

    const { user } = useContext(LoginContext);
    const { user_email, user_perfil } = user;
    const user_email_perfil = user_email;

    const [btnStatus, setBtnStatus] = useState<boolean>(false);

    /** Decide si un campo se oculta. Es la misma regla del módulo original, sin el `==`. */
    const estaOculto = useMemo(() => (campo: ICampoFormulario): boolean => {

        if (user_perfil === 'Colegios' && campo.disabledText === true) return true;

        if (user_perfil !== 'Administrador') {
            if (chequeo?.rut && campo.name === 'rut') return true;
            if (campo.name === 'user_email') return true;
            if (campo.name === 'status') return true;
            if (campo.name === 'fecha_atencion') return true;
        }

        return false;

    }, [user_perfil, chequeo?.rut]);

    const camposVisibles = useMemo(
        () => camposFormulario.filter((campo) => !estaOculto(campo)),
        [estaOculto],
    );

    const nombresVisibles = useMemo(
        () => camposVisibles.map((campo) => campo.name),
        [camposVisibles],
    );

    const { control, reset, handleSubmit, setValue, getValues, defaults } = useChequeo(nombresVisibles, chequeo);

    const construirChequeo = (datos: IChequeo): IChequeo => ({
        ...datos,
        user_email_perfil,
        user_email : datos.user_email ? datos.user_email : user_email_perfil,
    });

    const onCrear = async (datos: IChequeo) => {

        setBtnStatus(true);

        try {
            const { postCreateChequeo } = await UseChequeoCardiovascularService();
            const response = await postCreateChequeo(construirChequeo(datos));

            if (response) {
                await Swal.fire({
                    title            : '✅ Deportista listo para el chequeo',
                    html             : `El deportista <strong>${datos.nombre}</strong> fue creado con éxito.`,
                    icon             : 'success',
                    confirmButtonText: 'Aceptar',
                    timer            : 3000,
                    timerProgressBar : true,
                });

                reset(defaults);
                handleUpdateStatus(0, '', 0);
                handleReloadTable();
            }
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo guardar',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setBtnStatus(false);
        }
    };

    const onActualizar = async (datos: IChequeo) => {

        setBtnStatus(true);

        try {
            const { postUpdateChequeo } = await UseChequeoCardiovascularService();
            const response = await postUpdateChequeo(
                construirChequeo(datos), chequeo!.id!, user_email_perfil,
            );

            if (response) {
                await Swal.fire({
                    title            : '✅ Chequeo modificado',
                    html             : `El deportista <strong>${datos.nombre}</strong> fue modificado con éxito.`,
                    icon             : 'success',
                    confirmButtonText: 'Aceptar',
                    timer            : 3000,
                    timerProgressBar : true,
                });

                reset(defaults);
                handleUpdateStatus(0, '', 0);
                handleReloadTable();
            }
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo modificar',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setBtnStatus(false);
        }
    };

    const esEdicion = Boolean(chequeo);

    const renderCampo = (campo: ICampoFormulario) => {

        const { type, name, placeholder, label, defaultValue, helperText, values } = campo;

        if (type === 'text' || type === 'number') {
            return (
                <Grid item xs={12} md={6} key={name}>
                    <InputText
                        control={control}
                        type={type}
                        name={name as keyof IChequeo}
                        placeholder={placeholder}
                        label={label}
                        defaultValue={defaultValue}
                        helperText={helperText}
                        disabled={false}
                        setValue={setValue}
                        getValues={getValues}
                    />
                </Grid>
            );
        }

        if (type === 'DatePickers') {
            return (
                <Grid item xs={12} md={6} key={name}>
                    <DatePickers
                        control={control}
                        name={name as keyof IChequeo}
                        label={label}
                        defaultValue={defaultValue}
                        disabled={false}
                        setValue={setValue}
                    />
                </Grid>
            );
        }

        if (type === 'selected') {
            return (
                <Grid item xs={12} md={6} key={name}>
                    <InputSelect
                        control={control}
                        name={name as keyof IChequeo}
                        placeholder={placeholder}
                        label={label}
                        defaultValue={defaultValue}
                        helperText={helperText}
                        values={values ?? []}
                        disabled={false}
                    />
                </Grid>
            );
        }

        // `selected-user` es el selector de club, que solo ve `Administrador` y no se porta en
        // esta spec. Para `Colegios` el campo `user_email` siempre está oculto, así que no llega
        // hasta aquí; si un perfil futuro lo necesita, su spec traerá el componente.
        if (type === 'selected-user') return null;

        throw new Error(`El type "${type}" no está soportado en chequeo-cardiovascular.`);
    };

    return (
        <Box sx={{ flexGrow: 1, maxWidth: 900, mx: 'auto', px: { xs: 0, md: 2 } }}>
            <Paper
                elevation={0}
                sx={{
                    p            : { xs: 2.5, md: 4 },
                    borderRadius : 3,
                    border       : '1px solid #e3f2fd',
                    boxShadow    : '0 4px 20px rgba(0,0,0,0.06)',
                }}
            >
                <form onSubmit={handleSubmit(esEdicion ? onActualizar : onCrear)} noValidate>

                    {SECCIONES_FORMULARIO.map(({ id, titulo }) => {

                        const campos = camposVisibles.filter((campo) => campo.seccion === id);

                        return (
                            <SeccionCampos key={id} titulo={titulo} cantidad={campos.length}>
                                { campos.map(renderCampo) }
                            </SeccionCampos>
                        );
                    })}

                    <Grid container justifyContent="flex-end">
                        <Grid item xs={12} md={4}>
                            <ButtonsForm
                                onSubmit={handleSubmit(esEdicion ? onActualizar : onCrear)}
                                btnStatus={btnStatus}
                                title={esEdicion ? 'Guardar cambios' : 'Registrar deportista'}
                            />
                        </Grid>
                    </Grid>

                    <Typography
                        sx={{ mt: 2, fontSize: 12, color: 'text.secondary', textAlign: 'right' }}
                    >
                        Los campos con error se marcan en rojo al intentar guardar.
                    </Typography>
                </form>
            </Paper>
        </Box>
    );
};
