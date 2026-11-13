import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import textos from '../config/textos-certificados.json';
import type { IDocumentoCertificado, TipoDocumento } from '../interface';
import { guardarBlob, statusDelError, urlVencida } from '../utilities';

interface Props {
    documento: IDocumentoCertificado;
    etiqueta: string;
    ariaLabel: string;
    /** Nombre del archivo que se guarda, p. ej. «Certificado-Paciente-Ficticio.pdf». */
    nombreArchivo: string;
    /** Descarga la URL firmada como blob (lo resuelve la página con el servicio del módulo). */
    onDescargar: (url: string) => Promise<Blob>;
    /** Rehace la consulta y devuelve la URL firmada vigente de ese tipo, o null si ya no existe. */
    onRenovarUrl: (tipo: TipoDocumento) => Promise<string | null>;
}

/**
 * Botón de descarga con una sola variante para los cuatro documentos. Solo maneja su spinner y
 * su error: la descarga y la renovación de la URL llegan por props.
 *
 * - Archivo público (`expira === null`): enlace normal en pestaña nueva.
 * - PDF generado con URL firmada: si `expira` ya pasó, o el back responde **403** (firma
 *   vencida entre la consulta y el clic), se pide una URL nueva y se reintenta una vez. Un 404
 *   o un 500 no se reintentan: se muestra el error.
 */
export const BotonDescarga = ({ documento, etiqueta, ariaLabel, nombreArchivo, onDescargar, onRenovarUrl }: Props) => {

    const [descargando, setDescargando] = useState(false);
    const [error, setError] = useState(false);

    const estiloBoton = { textTransform: 'none', fontWeight: 600, minWidth: 200, width: { xs: '100%', sm: 'auto' } } as const;

    if (documento.expira === null) {
        return (
            <Button
                variant="contained"
                href={documento.url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
                aria-label={ariaLabel}
                sx={estiloBoton}
            >
                {etiqueta}
            </Button>
        );
    }

    const renovar = async (): Promise<string> => {

        const url = await onRenovarUrl(documento.tipo);

        if (url === null) {
            throw new Error('Documento no disponible');
        }

        return url;
    };

    const descargar = async () => {

        setDescargando(true);
        setError(false);

        try {
            const url = urlVencida(documento.expira) ? await renovar() : documento.url;
            let blob: Blob;

            try {
                blob = await onDescargar(url);
            } catch (problema) {
                if (statusDelError(problema) !== 403) throw problema;

                blob = await onDescargar(await renovar());
            }

            guardarBlob(blob, nombreArchivo);
        } catch {
            setError(true);
        } finally {
            setDescargando(false);
        }
    };

    return (
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
                variant="contained"
                onClick={descargar}
                disabled={descargando}
                aria-busy={descargando}
                aria-label={ariaLabel}
                startIcon={descargando ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
                sx={estiloBoton}
            >
                {etiqueta}
            </Button>

            {error && (
                <Typography role="alert" variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {textos.resultados.errorDescarga}
                </Typography>
            )}
        </Box>
    );
};
