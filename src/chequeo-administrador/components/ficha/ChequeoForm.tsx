import { useContext, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Swal from 'sweetalert2';

import { LoginContext } from '../../../common/context';
import { SECCIONES_FORMULARIO } from '../../config/secciones';
import { COLORES, SOMBRAS } from '../../config/tema';
import { useChequeo } from '../../hooks';
import type { ICampoFormulario, IChequeo } from '../../interface';
import { UseChequeoAdministradorService } from '../../services';
import { camposFormulario, escaparHtml } from '../../utilities';
import { ButtonsForm, DatePickers, InputSelect, InputText, SelectUser } from '../forms';
import { SeccionCampos } from './SeccionCampos';

interface Props {
    /** Sin chequeo es un alta; con chequeo, su edición. */
    chequeo?   : IChequeo;
    /** Si la ficha está a la vista: `SelectUser` pide los clubes en la primera activación. */
    activo     : boolean;
    /** Se llama tras guardar: el orquestador vuelve a alta limpia y recarga la lista. */
    onGuardado : () => void;
}

/**
 * Alta y edición del chequeo del Administrador.
 *
 * - **Los 25 campos**, agrupados en las cinco secciones de `seccion` (§6.4). El Administrador
 *   no tenía ningún campo oculto, así que no hay regla de ocultamiento que portar.
 * - **El botón pasa por `handleSubmit`** con el esquema de D4 (b): identificación obligatoria y
 *   el resto solo en formato. El original llamaba a `onSubmit` directo y no validaba nada.
 * - El cuerpo que viaja al backend es **el mismo** que armaba el original, campo a campo, leído
 *   con `getValues()` en vez de `control._formValues`.
 */
export const ChequeoForm = ({ chequeo, activo, onGuardado }: Props) => {

    const { user } = useContext(LoginContext);
    const user_email_perfil = user.user_email;

    const { control, handleSubmit, setValue, getValues, reset, defaults } = useChequeo(chequeo);

    const [btnStatus, setBtnStatus] = useState<boolean>(false);

    const esEdicion = !!chequeo;

    const avisarExito = (titulo: string, nombre: string, accion: string) => {

        Swal.fire({
            title             : titulo,
            html              : `El Paciente <strong>${escaparHtml(nombre)}</strong> Fue ${accion} con Exito!!!.`,
            icon              : 'success',
            confirmButtonText : 'Aceptar',
            timer             : 3000,
            timerProgressBar  : true,
        });
    };

    const avisarError = (problema: unknown) => {

        // El original no capturaba nada: un 500 dejaba el botón bloqueado para siempre.
        console.error('Error al guardar el chequeo:', problema);
        Swal.fire({
            title : '❌ No se pudo guardar',
            text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
            icon  : 'error',
        });
    };

    const onCrear = async () => {

        setBtnStatus(true);

        const v = getValues();

        // Mismo cuerpo que el original. `fecha_atencion` no viaja en el alta, igual que hoy.
        const nuevo: IChequeo = {
            nombre                  : v.nombre,
            rut                     : v.rut,
            fechaNacimiento         : v.fechaNacimiento,
            edad                    : v.edad,
            estatura                : v.estatura,
            peso                    : v.peso,
            hemoglucotest           : v.hemoglucotest,
            pulso                   : v.pulso,
            presionArterial         : v.presionArterial,
            presion_sistolica       : v.presion_sistolica,
            saturacionOxigeno       : v.saturacionOxigeno,
            temperatura             : v.temperatura,
            enfermedadesCronicas    : v.enfermedadesCronicas,
            medicamentosDiarios     : v.medicamentosDiarios,
            sistemaOsteoarticular   : v.sistemaOsteoarticular,
            sistemaCardiovascular   : v.sistemaCardiovascular,
            enfermedadesAnteriores  : v.enfermedadesAnteriores,
            Recuperacion            : v.Recuperacion,
            gradoIncidenciaPosterio : v.gradoIncidenciaPosterio,
            user_email_perfil,
            // Sin club elegido, el chequeo queda a nombre del propio Administrador, como hoy.
            user_email              : v.user_email ? v.user_email : user_email_perfil,
            sexo_paciente           : v.sexo_paciente,
            imc_paciente            : v.imc_paciente,
            status                  : v.status,
            division_paciente       : v.division_paciente,
            medio_pago_paciente     : v.medio_pago_paciente,
        };

        try {
            const { postCreateChequeo } = await UseChequeoAdministradorService();
            const response = await postCreateChequeo(nuevo);

            if (response) {
                avisarExito('✅ ¡Paciente Listo Para el Chequeo', v.nombre, 'Creado');
                reset(defaults);
                onGuardado();
            }
        }
        catch (problema) {
            avisarError(problema);
        }
        finally {
            setBtnStatus(false);
        }
    };

    const onActualizar = async () => {

        setBtnStatus(true);

        const v = getValues();

        const modificado: IChequeo = {
            nombre                  : v.nombre,
            rut                     : v.rut,
            fechaNacimiento         : v.fechaNacimiento,
            edad                    : v.edad,
            estatura                : v.estatura,
            peso                    : v.peso,
            hemoglucotest           : v.hemoglucotest,
            pulso                   : v.pulso,
            presionArterial         : v.presionArterial,
            presion_sistolica       : v.presion_sistolica,
            saturacionOxigeno       : v.saturacionOxigeno,
            temperatura             : v.temperatura,
            enfermedadesCronicas    : v.enfermedadesCronicas,
            medicamentosDiarios     : v.medicamentosDiarios,
            sistemaOsteoarticular   : v.sistemaOsteoarticular,
            sistemaCardiovascular   : v.sistemaCardiovascular,
            enfermedadesAnteriores  : v.enfermedadesAnteriores,
            Recuperacion            : v.Recuperacion,
            gradoIncidenciaPosterio : v.gradoIncidenciaPosterio,
            user_email              : v.user_email,
            user_email_perfil,
            sexo_paciente           : v.sexo_paciente,
            imc_paciente            : v.imc_paciente,
            status                  : v.status,
            division_paciente       : v.division_paciente,
            medio_pago_paciente     : v.medio_pago_paciente,
            fecha_atencion          : v.fecha_atencion,
        };

        try {
            const { postUpdateChequeo } = await UseChequeoAdministradorService();
            const response = await postUpdateChequeo(modificado, v.id!, user_email_perfil);

            if (response) {
                avisarExito('✅ ¡Paciente Chequeo Modificado!', v.nombre, 'Modificado');
                reset(defaults);
                onGuardado();
            }
        }
        catch (problema) {
            avisarError(problema);
        }
        finally {
            setBtnStatus(false);
        }
    };

    const renderCampo = (campo: ICampoFormulario) => {

        const { type, name, placeholder, label, helperText, values } = campo;
        const nombre = name as keyof IChequeo;

        if (type === 'text' || type === 'number') {
            return (
                <Grid item xs={12} sm={6} key={name}>
                    <InputText
                        control={control}
                        type={type}
                        name={nombre}
                        placeholder={placeholder}
                        label={label}
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
                <Grid item xs={12} sm={6} key={name}>
                    <DatePickers control={control} name={nombre} label={label} disabled={false} setValue={setValue} />
                </Grid>
            );
        }

        if (type === 'selected') {
            return (
                <Grid item xs={12} sm={6} key={name}>
                    <InputSelect
                        control={control}
                        name={nombre}
                        placeholder={placeholder}
                        label={label}
                        helperText={helperText}
                        values={values ?? []}
                        disabled={false}
                    />
                </Grid>
            );
        }

        if (type === 'selected-user') {
            return (
                <Grid item xs={12} sm={6} key={name}>
                    <SelectUser
                        control={control}
                        name={nombre}
                        placeholder={placeholder}
                        label={label}
                        helperText={helperText}
                        disabled={false}
                        activo={activo}
                    />
                </Grid>
            );
        }

        throw new Error(`El type "${type}" no está soportado en chequeo-administrador.`);
    };

    const enviar = handleSubmit(esEdicion ? onActualizar : onCrear);

    return (
        <Box sx={{ flexGrow: 1, py: 4, mx: 'auto', maxWidth: { xs: '100%', md: '80%' } }}>
            <Paper
                elevation={0}
                sx={{
                    p            : { xs: 2.5, md: 4 },
                    borderRadius : 3,
                    border       : `1px solid ${COLORES.fondoSuave}`,
                    boxShadow    : SOMBRAS.formulario,
                }}
            >
                <form onSubmit={enviar} noValidate>

                    {SECCIONES_FORMULARIO.map(({ id, titulo }) => {

                        const campos = camposFormulario.filter((campo) => campo.seccion === id);

                        return (
                            <SeccionCampos key={id} titulo={titulo} cantidad={campos.length}>
                                { campos.map(renderCampo) }
                            </SeccionCampos>
                        );
                    })}

                    <Grid container justifyContent="center">
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                            <ButtonsForm
                                onSubmit={enviar}
                                btnStatus={btnStatus}
                                title={esEdicion ? 'Editar' : 'Registrar chequeo'}
                            />
                        </Grid>
                    </Grid>

                    <Typography sx={{ mt: 2, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                        Solo la identificación es obligatoria; el resto se revisa si viene relleno.
                    </Typography>
                </form>
            </Paper>
        </Box>
    );
};
