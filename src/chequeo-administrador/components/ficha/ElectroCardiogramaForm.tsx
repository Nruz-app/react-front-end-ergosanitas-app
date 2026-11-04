import { useState } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Swal from 'sweetalert2';

import { COLORES, DEGRADADOS, SOMBRAS, UI, sxFocoVisible } from '../../config/tema';
import { useChequeoRut, useElectroCardiograma } from '../../hooks';
import type { IElectroCardiograma } from '../../interface';
import { UseElectroCardiogramaService } from '../../services';
import { camposElectro, esPdf, escaparHtml } from '../../utilities';
import { ButtonsForm, InputSelect, InputText } from '../forms';
import { PreviewFileDialog } from './PreviewFileDialog';

interface Props {
    rut_paciente : string;
    id_paciente  : number;
    /** URL del certificado ya emitido; `''` si no hay. */
    url_pdf      : string;
    onGuardado   : () => void;
}

/** Un dato de la cabecera, o «—» si no se midió. Nunca «undefined kg» en pantalla. */
const mostrar = (valor?: string | number | null, unidad = ''): string =>
    valor === null || valor === undefined || valor === '' ? '—' : `${valor}${unidad}`;

/**
 * Revisión médica (modo `revision` de la ficha): cabecera del paciente, visor del certificado
 * y el formulario de diagnóstico.
 *
 * Cambios respecto al original:
 *
 * - **Sin la rama `Medicos`** (§7.1): aquí siempre es Administrador, que confirma sin Ergo Pass,
 *   así que `ValidateDialog` y `userUpdateErgoPass` no se clonan.
 * - **La cabecera usa `useChequeoRut`** en vez del `getChequeoCardiovascular` duplicado.
 * - **El botón pasa por `handleSubmit`**: los cuatro campos son visibles y tres declaran
 *   `required`. El original solo miraba los errores *ya mostrados*, así que con el formulario
 *   sin tocar guardaba un diagnóstico vacío.
 *
 * ⚠️ La cabecera rotula la estatura en «cm» aunque `UseCalculoIMC` la exige en metros. Se
 * clona igual (§7.2) y queda para la spec del formulario.
 */
export const ElectroCardiogramaForm = ({ rut_paciente, id_paciente, url_pdf, onGuardado }: Props) => {

    const { control, handleSubmit, getValues, reset } = useElectroCardiograma();
    const { chequeo } = useChequeoRut(id_paciente);

    const [openPreview, setOpenPreview] = useState(false);
    const [btnStatus, setBtnStatus] = useState(false);

    const pdf = esPdf(url_pdf);

    const onSubmit = async () => {

        setBtnStatus(true);

        const v = getValues();

        const electro: IElectroCardiograma = {
            rut_paciente,
            id_paciente,
            estado_paciente              : v.estado_paciente,
            frecuencia_cardiaca_paciente : v.frecuencia_cardiaca_paciente,
            derivacion_paciente          : v.derivacion_paciente,
            observacion_paciente         : v.observacion_paciente,
            imc_paciente                 : v.imc_paciente,
        };

        try {
            const { postCreateElectroCardiograma } = await UseElectroCardiogramaService();
            const resp = await postCreateElectroCardiograma(electro);

            if (resp) {
                Swal.fire({
                    title : 'Paciente Listo',
                    html  : `El paciente ${escaparHtml(rut_paciente)} fue ingresado con éxito`,
                    icon  : 'success',
                });
                reset();
                onGuardado();
            }
        }
        catch (problema) {
            console.error('Error al guardar el electrocardiograma:', problema);
            Swal.fire({
                icon  : 'error',
                title : 'Error al ingresar Electrocardiograma',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
            });
        }
        finally {
            setBtnStatus(false);
        }
    };

    const onInvalido = () => {

        Swal.fire({
            icon             : 'error',
            title            : 'Error al ingresar Electrocardiograma',
            text             : 'Por favor ingrese todos los valores del formulario',
            timer            : 3000,
            timerProgressBar : true,
        });
    };

    const enviar = handleSubmit(onSubmit, onInvalido);

    return (
        <>
            <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>

                {chequeo && (
                    <Paper
                        elevation={3}
                        sx={{
                            mb           : 4,
                            p            : 3,
                            borderRadius : 3,
                            background   : DEGRADADOS.cabeceraEcg,
                            transition   : 'box-shadow 0.3s ease',
                            '&:hover'    : { boxShadow: SOMBRAS.cabeceraEcg },
                        }}
                    >
                        <Grid container spacing={2}>
                            {Object.entries({
                                'Nombre'                : mostrar(chequeo.nombre),
                                'Edad'                  : mostrar(chequeo.edad),
                                'Presión Arterial'      : `${mostrar(chequeo.presion_sistolica)}/${mostrar(chequeo.presionArterial)}`,
                                'Glicemia Capilar'      : mostrar(chequeo.hemoglucotest),
                                'Peso'                  : mostrar(chequeo.peso, ' kg'),
                                'Altura'                : mostrar(chequeo.estatura, ' cm'),
                                'IMC'                   : mostrar(chequeo.imc_paciente),
                                'Enfermedades Crónicas' : mostrar(chequeo.enfermedadesCronicas),
                                'Medicamentos'          : mostrar(chequeo.medicamentosDiarios),
                            }).map(([label, value]) => (
                                <Grid item xs={12} sm={6} md={3} key={label}>
                                    <Typography variant="caption" color="text.secondary">{ label }</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" noWrap title={value}>{ value }</Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                <Grid container spacing={4} alignItems="flex-start" justifyContent="center">

                    {/* VISOR DEL CERTIFICADO */}
                    <Grid item xs={12} md={8}>
                        {/* Un `div` clicable como en el original, no un `<button>`: dentro va un
                            iframe, que no puede vivir en un botón. El clic sobre el PDF lo
                            consume el iframe (se puede desplazar el documento); para abrir la
                            vista completa por teclado está el botón de abajo. */}
                        <Paper
                            elevation={4}
                            onClick={() => setOpenPreview(true)}
                            sx={{
                                position       : 'relative',
                                cursor         : 'zoom-in',
                                borderRadius   : 3,
                                overflow       : 'hidden',
                                height         : { xs: '50vh', md: '80vh' },
                                display        : 'flex',
                                justifyContent : 'center',
                                alignItems     : 'center',
                                transition     : 'box-shadow 0.3s ease',
                                '&:hover'      : { boxShadow: SOMBRAS.visor },
                                '&:hover .overlay': { opacity: 1 },
                            }}
                        >
                            {pdf ? (
                                <iframe
                                    src={url_pdf}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Vista previa del certificado"
                                />
                            ) : (
                                <Box
                                    component="img"
                                    src={url_pdf}
                                    alt="Vista previa del certificado"
                                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            )}

                            <Box
                                className="overlay"
                                aria-hidden="true"
                                sx={{
                                    position       : 'absolute',
                                    inset          : 0,
                                    background     : UI.veloVisor,
                                    opacity        : 0,
                                    transition     : 'opacity 0.3s ease',
                                    display        : 'flex',
                                    justifyContent : 'center',
                                    alignItems     : 'center',
                                    color          : COLORES.textoSobrePrimario,
                                    flexDirection  : 'column',
                                    gap            : 1,
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                }}
                            >
                                <ZoomInIcon sx={{ fontSize: 55 }} />
                                <Typography variant="h6">Ver en pantalla completa</Typography>
                            </Box>
                        </Paper>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Button
                                size="small"
                                startIcon={<ZoomInIcon aria-hidden="true" />}
                                onClick={() => setOpenPreview(true)}
                                sx={{ textTransform: 'none', ...sxFocoVisible }}
                            >
                                Ver en pantalla completa
                            </Button>
                        </Box>
                    </Grid>

                    {/* FORMULARIO DE DIAGNÓSTICO */}
                    <Grid item xs={12} md={4}>
                        <form onSubmit={enviar} noValidate>
                            <Grid container spacing={3}>
                                {camposElectro.map(({ type, name, placeholder, label, helperText, values, multiline }) => {

                                    const nombre = name as keyof IElectroCardiograma;

                                    if (type === 'text' || type === 'number') {
                                        return (
                                            <Grid item xs={12} key={name}>
                                                <InputText
                                                    control={control}
                                                    type={type}
                                                    name={nombre}
                                                    placeholder={placeholder}
                                                    label={label}
                                                    helperText={helperText}
                                                    disabled={false}
                                                    multiline={multiline}
                                                />
                                            </Grid>
                                        );
                                    }

                                    if (type === 'selected') {
                                        return (
                                            <Grid item xs={12} key={name}>
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

                                    throw new Error(`El type "${type}" no está soportado en la revisión médica.`);
                                })}
                            </Grid>

                            <Grid container justifyContent="center" sx={{ mt: 3 }}>
                                <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                                    <ButtonsForm onSubmit={enviar} title="Confirmar" btnStatus={btnStatus} />
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Box>

            <PreviewFileDialog open={openPreview} onClose={() => setOpenPreview(false)} url_pdf={url_pdf} />
        </>
    );
};
