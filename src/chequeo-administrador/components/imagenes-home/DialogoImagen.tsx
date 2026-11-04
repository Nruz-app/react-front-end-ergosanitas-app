import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    MenuItem, TextField, Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
    ACCEPT_IMAGEN, ETIQUETA_SECCION, MAXIMO_ALT, MAXIMO_CAPTION, SECCIONES_IMAGEN,
} from '../../config/imagenes-home';
import { COLORES, IMAGENES, UI, sxFocoVisible } from '../../config/tema';
import type { IImagenHome, IImagenHomeForm, IImagenHomeValores } from '../../interface';
import { aFormularioImagen, imagenHomeValidationSchema, valoresInicialesImagen } from '../../utilities';

/** Id del `<form>`, para que el botón «Guardar» de `DialogActions` lo envíe desde fuera. */
const ID_FORMULARIO = 'formulario-imagen-home';

interface Props {
    abierto       : boolean;
    /** `null` abre el diálogo en modo **agregar**; una imagen, en modo **editar**. */
    imagen        : IImagenHome | null;
    /** `true` mientras el `POST` o el `PUT` está en vuelo: bloquea los botones y el cierre. */
    guardando     : boolean;
    handleCerrar  : () => void;
    handleGuardar : (form: IImagenHomeForm) => void;
}

/**
 * Un solo diálogo para «Agregar imagen» y «Editar imagen» (Spec 02).
 *
 * - **Agregar**: el archivo es obligatorio (jpg/png/webp, hasta 5 MB, validado aquí y en el
 *   back) y se previsualiza con `URL.createObjectURL`. La URL se libera al cambiar de archivo y
 *   al cerrar, para no dejar el blob retenido en memoria.
 * - **Editar**: se muestra la imagen actual y **el archivo no cambia**. Para cambiarlo se
 *   elimina y se vuelve a agregar; así el back no tiene que reemplazar archivos.
 *
 * El diálogo no llama al servicio: entrega el `IImagenHomeForm` a la página, que hace la
 * petición y lo cierra si sale bien. Si falla, queda abierto con lo escrito.
 */
export const DialogoImagen = ({ abierto, imagen, guardando, handleCerrar, handleGuardar }: Props) => {

    const agregando = imagen === null;

    const resolver = useMemo(
        () => yupResolver(imagenHomeValidationSchema(agregando)) as unknown as Resolver<IImagenHomeValores>,
        [agregando],
    );

    const { control, reset, handleSubmit, watch, formState: { errors } } = useForm<IImagenHomeValores>({
        resolver,
        defaultValues : valoresInicialesImagen(imagen),
        mode          : 'onTouched',
    });

    /** Cada apertura arranca limpia, con los valores de la carta elegida o vacíos. */
    useEffect(() => {

        if (abierto) reset(valoresInicialesImagen(imagen));

    }, [abierto, imagen, reset]);

    const archivo = watch('archivo');
    const [vistaPrevia, setVistaPrevia] = useState('');

    /** El `<input type="file">` oculto; el botón lo abre con `click()`, como `CargaMasivaEcg`. */
    const inputArchivo = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        if (!abierto || !archivo) {
            setVistaPrevia('');
            return;
        }

        const url = URL.createObjectURL(archivo);
        setVistaPrevia(url);

        return () => URL.revokeObjectURL(url);

    }, [abierto, archivo]);

    const srcVista = agregando ? vistaPrevia : imagen.src;

    const cerrar = () => {
        if (!guardando) handleCerrar();
    };

    const enviar = (valores: IImagenHomeValores) => handleGuardar(aFormularioImagen(valores));

    return (
        // `disableEnforceFocus`: el error de un guardado fallido sale en un Swal con el diálogo
        // abierto. Con la trampa de foco de MUI, el foco volvía al formulario y el Enter con que el
        // usuario cerraba el aviso **reenviaba** el formulario por detrás.
        <Dialog
            open={abierto}
            onClose={cerrar}
            fullWidth
            maxWidth="sm"
            aria-labelledby="titulo-dialogo-imagen"
            disableEnforceFocus
        >

            <DialogTitle id="titulo-dialogo-imagen" sx={{ fontWeight: 700, color: COLORES.primarioOsc }}>
                { agregando ? 'Agregar imagen' : 'Editar imagen' }
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    component="form"
                    id={ID_FORMULARIO}
                    noValidate
                    onSubmit={handleSubmit(enviar)}
                    sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}
                >
                    {/* Vista previa en el mismo marco 2:3 con `contain` que la carta y el Home. */}
                    <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
                        <Box
                            sx={{
                                aspectRatio     : '2 / 3',
                                borderRadius    : 2,
                                overflow        : 'hidden',
                                border          : `1px dashed ${errors.archivo ? UI.peligro : COLORES.borde}`,
                                backgroundColor : IMAGENES.fondoMarco,
                                display         : 'flex',
                                alignItems      : 'center',
                                justifyContent  : 'center',
                                maxHeight       : { xs: 260, sm: 'none' },
                                mx              : 'auto',
                            }}
                        >
                            { srcVista ? (
                                <Box
                                    component="img"
                                    src={srcVista}
                                    alt="Vista previa de la imagen"
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            ) : (
                                <Typography sx={{ fontSize: 12, color: COLORES.textoSuave, px: 2, textAlign: 'center' }}>
                                    Sin imagen seleccionada
                                </Typography>
                            )}
                        </Box>

                        { agregando ? (
                            <Controller
                                name="archivo"
                                control={control}
                                render={({ field: { onChange, ref } }) => (
                                    <Box sx={{ mt: 1.5 }}>
                                        {/* Un `Button` real y no `component="label"`: un `<label>`
                                            no se activa con Enter ni Espacio, y el archivo solo se
                                            podía elegir con el ratón. */}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<UploadFileIcon />}
                                            disabled={guardando}
                                            onClick={() => inputArchivo.current?.click()}
                                            sx={sxFocoVisible}
                                        >
                                            { archivo ? 'Cambiar archivo' : 'Elegir archivo' }
                                        </Button>
                                        <input
                                            ref={(elemento) => {
                                                ref(elemento);
                                                inputArchivo.current = elemento;
                                            }}
                                            hidden
                                            type="file"
                                            accept={ACCEPT_IMAGEN}
                                            onChange={(evento) => {
                                                onChange(evento.target.files?.[0] ?? null);
                                                // Permite volver a elegir el mismo archivo tras un error.
                                                evento.target.value = '';
                                            }}
                                        />
                                        <Typography
                                            role={errors.archivo ? 'alert' : undefined}
                                            sx={{
                                                fontSize  : 12,
                                                mt        : 0.75,
                                                color     : errors.archivo ? UI.peligro : COLORES.textoSuave,
                                                wordBreak : 'break-all',
                                            }}
                                        >
                                            { errors.archivo?.message ?? (archivo ? archivo.name : 'JPG, PNG o WEBP, hasta 5 MB') }
                                        </Typography>
                                    </Box>
                                )}
                            />
                        ) : (
                            <Typography sx={{ fontSize: 12, mt: 0.75, color: COLORES.textoSuave }}>
                                El archivo no se cambia al editar. Para usar otro, elimina esta imagen y agrega la nueva.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                        <Controller
                            name="seccion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    size="small"
                                    label="Sección"
                                    required
                                    disabled={guardando}
                                    error={!!errors.seccion}
                                    helperText={errors.seccion?.message ?? 'Dónde aparece en el Home.'}
                                >
                                    { SECCIONES_IMAGEN.map((seccion) => (
                                        <MenuItem key={seccion} value={seccion}>{ ETIQUETA_SECCION[seccion] }</MenuItem>
                                    )) }
                                </TextField>
                            )}
                        />

                        <Controller
                            name="alt"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Texto alternativo"
                                    required
                                    multiline
                                    minRows={2}
                                    disabled={guardando}
                                    inputProps={{ maxLength: MAXIMO_ALT }}
                                    error={!!errors.alt}
                                    helperText={errors.alt?.message ?? 'Describe la imagen para quien no la ve.'}
                                />
                            )}
                        />

                        <Controller
                            name="caption"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Título"
                                    disabled={guardando}
                                    inputProps={{ maxLength: MAXIMO_CAPTION }}
                                    error={!!errors.caption}
                                    helperText={errors.caption?.message ?? `Opcional. ${field.value.length}/${MAXIMO_CAPTION}`}
                                />
                            )}
                        />

                        <Controller
                            name="orden"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Orden"
                                    disabled={guardando}
                                    inputProps={{ inputMode: 'numeric' }}
                                    error={!!errors.orden}
                                    helperText={
                                        errors.orden?.message
                                        ?? (agregando
                                            ? 'Opcional. Vacío la deja al final de su sección.'
                                            : 'Menor sale primero dentro de su sección.')
                                    }
                                />
                            )}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5 }}>
                <Button onClick={cerrar} disabled={guardando} sx={sxFocoVisible}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form={ID_FORMULARIO}
                    variant="contained"
                    disabled={guardando}
                    startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : undefined}
                    sx={sxFocoVisible}
                >
                    { guardando ? 'Guardando…' : agregando ? 'Agregar' : 'Guardar cambios' }
                </Button>
            </DialogActions>
        </Dialog>
    );
};
