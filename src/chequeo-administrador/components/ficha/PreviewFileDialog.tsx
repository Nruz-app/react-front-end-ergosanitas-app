import { useState } from 'react';
import { AppBar, Box, Dialog, IconButton, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import { UI } from '../../config/tema';
import { esPdf } from '../../utilities';

interface Props {
    open     : boolean;
    onClose  : () => void;
    url_pdf? : string;
}

/** Vista a pantalla completa del certificado de la revisión médica, con zoom en imágenes. */
export const PreviewFileDialog = ({ open, onClose, url_pdf }: Props) => {

    const [zoom, setZoom] = useState(1);

    const pdf = esPdf(url_pdf);

    return (
        <Dialog fullScreen open={open} onClose={onClose} aria-label="Vista previa del certificado">

            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Cerrar vista previa">
                        <CloseIcon />
                    </IconButton>

                    <Typography sx={{ ml: 2, flex: 1 }}>Vista previa</Typography>

                    {!pdf && (
                        <>
                            <IconButton color="inherit" onClick={() => setZoom((z) => z + 0.2)} aria-label="Acercar">
                                <ZoomInIcon />
                            </IconButton>
                            <IconButton color="inherit" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} aria-label="Alejar">
                                <ZoomOutIcon />
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    width           : '100%',
                    height          : '100%',
                    display         : 'flex',
                    justifyContent  : 'center',
                    alignItems      : 'center',
                    backgroundColor : UI.fondoVisor,
                }}
            >
                {pdf ? (
                    <iframe src={url_pdf} style={{ width: '100%', height: '100%', border: 'none' }} title="Certificado en PDF" />
                ) : (
                    <Box
                        component="img"
                        src={url_pdf}
                        alt="Certificado del electrocardiograma"
                        sx={{
                            transform  : `scale(${zoom})`,
                            transition : 'transform 0.2s ease',
                            maxWidth   : '100%',
                            maxHeight  : '100%',
                            objectFit  : 'contain',
                            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                        }}
                    />
                )}
            </Box>
        </Dialog>
    );
};
