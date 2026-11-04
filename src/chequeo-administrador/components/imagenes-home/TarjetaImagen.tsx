import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { COLOR_SECCION, ETIQUETA_SECCION } from '../../config/imagenes-home';
import { COLORES, IMAGENES, SOMBRAS, UI, sxFocoVisible } from '../../config/tema';
import type { IImagenHome } from '../../interface';

interface Props {
    imagen          : IImagenHome;
    /** `true` mientras su `PUT .../activo` está en vuelo: evita el doble clic. */
    cambiandoActivo : boolean;
    handleActivo    : (imagen: IImagenHome) => void;
    handleEditar    : (imagen: IImagenHome) => void;
    handleEliminar  : (imagen: IImagenHome) => void;
}

/**
 * Una imagen del Home como carta (Spec 02): la imagen manda, y debajo van el caption, los dos
 * chips (sección y visibilidad), el orden y las tres acciones.
 *
 * La imagen va en un marco 2:3 con `object-fit: contain`, igual que en el Home: son flyers con
 * texto quemado y `cover` recortaría la oferta. Las fotos de galería quedan con franjas, que es
 * el precio de verlas enteras en un mantenedor.
 *
 * Una imagen **oculta no desaparece**: se atenúa y lleva el chip «Oculta», porque el
 * Administrador tiene que poder volver a mostrarla. Eliminar va aparte y en rojo, y pide
 * confirmación en la página: es irreversible, a diferencia de ocultar.
 */
export const TarjetaImagen = ({ imagen, cambiandoActivo, handleActivo, handleEditar, handleEliminar }: Props) => {

    const { seccion, src, alt, caption, activo, orden } = imagen;
    const titulo = caption || alt;

    return (
        <Box
            component="article"
            aria-label={`${titulo}${activo ? '' : ' (oculta)'}`}
            sx={{
                display         : 'flex',
                flexDirection   : 'column',
                borderRadius    : 3,
                overflow        : 'hidden',
                border          : `1px solid ${COLORES.borde}`,
                backgroundColor : COLORES.fondoTarjeta,
                boxShadow       : SOMBRAS.tarjeta,
            }}
        >
            <Box sx={{ opacity: activo ? 1 : IMAGENES.opacidadOculta, transition: 'opacity .2s ease' }}>
                <Box
                    component="img"
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    sx={{
                        width           : '100%',
                        aspectRatio     : '2 / 3',
                        objectFit       : 'contain',
                        display         : 'block',
                        backgroundColor : IMAGENES.fondoMarco,
                    }}
                />
            </Box>

            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>

                <Typography
                    title={titulo}
                    sx={{
                        fontWeight      : 600,
                        fontSize        : 14,
                        lineHeight      : 1.35,
                        // Dos líneas como máximo, para que todas las cartas de una fila midan igual.
                        display         : '-webkit-box',
                        WebkitLineClamp : 2,
                        WebkitBoxOrient : 'vertical',
                        overflow        : 'hidden',
                        minHeight       : '2.7em',
                    }}
                >
                    { titulo }
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                        size="small"
                        label={ETIQUETA_SECCION[seccion]}
                        sx={{ fontWeight: 600, color: COLORES.fondoTarjeta, backgroundColor: COLOR_SECCION[seccion] }}
                    />
                    <Chip
                        size="small"
                        variant="outlined"
                        label={activo ? 'Visible' : 'Oculta'}
                        sx={{
                            fontWeight  : 600,
                            color       : activo ? IMAGENES.visible : IMAGENES.oculta,
                            borderColor : activo ? IMAGENES.visible : IMAGENES.oculta,
                        }}
                    />
                    <Typography component="span" sx={{ fontSize: 12, color: COLORES.textoSuave, ml: 'auto' }}>
                        Orden { orden }
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 'auto' }}>
                    <Tooltip title={activo ? 'Ocultar del Home' : 'Mostrar en el Home'}>
                        {/* El `span` deja que el Tooltip funcione con el botón deshabilitado. */}
                        <span>
                            <IconButton
                                size="small"
                                aria-label={activo ? `Ocultar ${titulo} del Home` : `Mostrar ${titulo} en el Home`}
                                disabled={cambiandoActivo}
                                onClick={() => handleActivo(imagen)}
                                sx={{ color: COLORES.textoSuave, ...sxFocoVisible }}
                            >
                                { activo ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" /> }
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            aria-label={`Editar ${titulo}`}
                            onClick={() => handleEditar(imagen)}
                            sx={{ color: COLORES.primario, ...sxFocoVisible }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            aria-label={`Eliminar ${titulo}`}
                            onClick={() => handleEliminar(imagen)}
                            sx={{ color: UI.peligro, ...sxFocoVisible }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};
