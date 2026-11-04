import { useState } from 'react';
import { Box, Grid, IconButton, Paper, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';

import { COLORES, UI, sxFocoVisible } from '../../config/tema';
import type { IRespuestaUsuario } from '../../interface';
import { UseUsuarioService } from '../../services';
import { InputPassword } from './InputPassword';

interface Props {
    user_email: string;
}

interface Credencial {
    id       : string;
    etiqueta : string;
    /** Cómo se nombra en los textos de confirmación: «la Contraseña», «el Ergo Pass». */
    conArticulo : string;
}

const CONTRASENA : Credencial = { id: 'cuenta-contrasena', etiqueta: 'Contraseña', conArticulo: 'la Contraseña' };
const ERGO_PASS  : Credencial = { id: 'cuenta-ergo-pass', etiqueta: 'Ergo Pass', conArticulo: 'el Ergo Pass' };

const sxLapiz = {
    color      : UI.accionCuenta,
    transition : '0.3s',
    '&:hover'  : { backgroundColor: UI.accionCuentaHover, color: COLORES.textoSobrePrimario },
    '&:active' : { backgroundColor: UI.accionCuentaActiva },
    ...sxFocoVisible,
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
};

/**
 * Tarjeta «Modificar Contraseña / Modificar Ergo Pass» de «Mi cuenta». Clon 1:1 (D6 a): el
 * rediseño de la pantalla es la Spec 02.
 *
 * Cambios mínimos:
 *
 * - Las erratas «Modficar» y el `</strong>` suelto de los textos de confirmación (§6.2).
 * - **Un campo vacío no se envía.** El original mandaba la cadena vacía al backend, que la
 *   habría guardado como contraseña. Se avisa y no se llama al servicio.
 * - Un fallo se avisa; el original solo avisaba del éxito. Tras guardar, el campo se vacía.
 */
export const FormCredenciales = ({ user_email }: Props) => {

    const [newPassword, setNewPassword] = useState('');
    const [ergoPass, setErgoPass] = useState('');

    const actualizar = async (
        credencial : Credencial,
        valor      : string,
        enviar     : (valor: string, email: string) => Promise<IRespuestaUsuario>,
        limpiar    : () => void,
    ) => {

        if (!valor.trim()) {
            Swal.fire({ title: `Falta ${credencial.conArticulo}`, text: `Escribe ${credencial.conArticulo} antes de guardar.`, icon: 'warning' });
            return;
        }

        const confirmacion = await Swal.fire({
            title             : `❓ ¿Modificar ${credencial.etiqueta}?`,
            text              : `¿Está seguro de modificar ${credencial.conArticulo}?`,
            icon              : 'warning',
            showCancelButton  : true,
            confirmButtonText : 'Aceptar',
            cancelButtonText  : 'Cancelar',
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const response = await enviar(valor, user_email);

            if (response.success) {
                Swal.fire({
                    title             : `✅ ¡Modificar ${credencial.etiqueta}!`,
                    text              : `${credencial.conArticulo.charAt(0).toUpperCase()}${credencial.conArticulo.slice(1)} se ha modificado con éxito.`,
                    icon              : 'success',
                    confirmButtonText : 'Aceptar',
                    timer             : 3000,
                    timerProgressBar  : true,
                });
                limpiar();
            }
            else {
                Swal.fire({ title: `No se modificó ${credencial.conArticulo}`, text: response.message, icon: 'warning' });
            }
        }
        catch (problema) {
            console.error(`Error al modificar ${credencial.conArticulo}:`, problema);
            Swal.fire({
                title : '❌ No se pudo guardar',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
    };

    const handleUpdatePassword = async () => {
        const { PostUserPassword } = await UseUsuarioService();
        await actualizar(CONTRASENA, newPassword, PostUserPassword, () => setNewPassword(''));
    };

    const handleUpdateErgoPass = async () => {
        const { PostUserErgoPass } = await UseUsuarioService();
        await actualizar(ERGO_PASS, ergoPass, PostUserErgoPass, () => setErgoPass(''));
    };

    const fila = (credencial: Credencial, valor: string, setValor: (v: string) => void, onGuardar: () => void, mt = 0) => (
        <Grid container spacing={2} alignItems="center" sx={{ mt }}>
            <Grid item xs={9} sm={8}>
                <InputPassword
                    id={credencial.id}
                    newPassword={valor}
                    setNewPassword={setValor}
                    label={`Modificar ${credencial.etiqueta}`}
                />
            </Grid>
            <Grid item xs={3} sm={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title={`Modificar ${credencial.etiqueta}`} arrow>
                        <IconButton onClick={onGuardar} aria-label={`Guardar ${credencial.etiqueta}`} sx={sxLapiz}>
                            <EditIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Paper elevation={4} sx={{ borderRadius: 3, p: 2, backgroundColor: UI.fondoCampo }}>
                { fila(CONTRASENA, newPassword, setNewPassword, handleUpdatePassword) }
                { fila(ERGO_PASS, ergoPass, setErgoPass, handleUpdateErgoPass, 4) }
            </Paper>
        </Box>
    );
};
