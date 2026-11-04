import { ChangeEvent, useId, useState } from 'react';
import { Avatar, Box, Grid, Paper, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Swal from 'sweetalert2';

import { COLORES, UI, sxFocoVisible } from '../../config/tema';
import { UseUsuarioService } from '../../services';

interface Props {
    user_email : string;
    /** Logo actual del usuario, `''` si no tiene. */
    user_logo  : string;
}

/**
 * Tarjeta «Cargar Logo» de «Mi cuenta». Clon 1:1 de `logo/fileUploadLogo` (D6 a), sin
 * `UseRegister` de `src/Login/`.
 *
 * ⚠️ Paridad conocida: el texto bajo el avatar dice «Sin logo» hasta que se sube uno **en esta
 * sesión**, aunque el usuario ya tenga logo. Lo detectó la revisión de la spec; se corrige con
 * el rediseño de «Mi cuenta» (Spec 02).
 *
 * Cambios mínimos: elegir y cancelar el diálogo de archivo ya no envía `null` al backend, y un
 * fallo de la subida se avisa.
 */
export const TarjetaLogo = ({ user_email, user_logo }: Props) => {

    const idInput = useId();

    const [logoUser, setLogoUser] = useState(user_logo);
    const [cargado, setCargado] = useState(false);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {

        const archivo = event.target.files?.[0];
        event.target.value = '';

        if (!archivo) return;

        try {
            const { loadLogoUser } = await UseUsuarioService();
            const response = await loadLogoUser(archivo, user_email);

            if (response) {
                setLogoUser(response.user_logo);
                setCargado(true);
                Swal.fire({ title: 'Logo del Club', text: 'Se ha cargado correctamente', icon: 'success', confirmButtonText: 'Ok' });
            }
        }
        catch (problema) {
            console.error('Error al cargar el logo:', problema);
            Swal.fire({
                title : '❌ No se pudo cargar el logo',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Paper elevation={4} sx={{ borderRadius: 3, p: 4, backgroundColor: UI.fondoCampo }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                                src={logoUser}
                                alt={cargado ? 'Logo del club' : 'Sin logo del club'}
                                sx={{
                                    width   : 100,
                                    height  : 100,
                                    bgcolor : 'grey.300',
                                    border  : `4px solid ${COLORES.primario}`,
                                    mb      : 2,
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                { cargado ? 'Logo cargado' : 'Sin logo' }
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <input accept="image/*" style={{ display: 'none' }} id={idInput} type="file" onChange={handleFileChange} />
                            <Typography
                                variant="body1"
                                component="label"
                                htmlFor={idInput}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    // Un `<label>` no se activa con teclado: sin esto el logo
                                    // solo se podía cargar con el ratón.
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        document.getElementById(idInput)?.click();
                                    }
                                }}
                                sx={{
                                    display         : 'inline-flex',
                                    alignItems      : 'center',
                                    color           : COLORES.textoSobrePrimario,
                                    fontSize        : '1rem',
                                    padding         : '8px 16px',
                                    borderRadius    : '8px',
                                    backgroundColor : UI.accionCuenta,
                                    cursor          : 'pointer',
                                    transition      : 'background-color 0.3s ease',
                                    '&:hover'       : { backgroundColor: UI.accionCuentaHover },
                                    '&:active'      : { backgroundColor: UI.accionCuentaActiva },
                                    ...sxFocoVisible,
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                }}
                            >
                                <UploadFileIcon sx={{ mr: 1 }} aria-hidden="true" />
                                Cargar Logo
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};
