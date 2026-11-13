import { ReactNode, useId } from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

import { BotonDescarga } from './BotonDescarga';
import type { IBotonTarjeta, TipoDocumento } from '../interface';
import { formatearFecha } from '../utilities';
import textos from '../config/textos-certificados.json';

interface Props {
    titulo: string;
    icono: ReactNode;
    nombre: string | null;
    botones: IBotonTarjeta[];
    ayuda?: string;
    onDescargar: (url: string) => Promise<Blob>;
    onRenovarUrl: (tipo: TipoDocumento) => Promise<string | null>;
}

/**
 * Una tarjeta por examen (chequeo cardiovascular o bioimpedancia). Solo se pinta si trae al
 * menos un documento; cada botón solo existe si su `tipo` vino en la respuesta del back.
 */
export const TarjetaDocumentos = ({ titulo, icono, nombre, botones, ayuda, onDescargar, onRenovarUrl }: Props) => {

    const idTitulo = useId();

    if (botones.length === 0) return null;

    return (
        <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }} component="section" aria-labelledby={idTitulo}>
            <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ color: 'primary.main', display: 'flex' }} aria-hidden>
                        {icono}
                    </Box>
                    <Box>
                        <Typography id={idTitulo} variant="h6" component="h3" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {titulo}
                        </Typography>
                        {nombre && (
                            <Typography variant="body2" color="text.secondary">
                                {nombre}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                    {botones.map(({ documento, etiqueta, ariaLabel, nombreArchivo }) => (
                        <Box
                            key={documento.tipo}
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {textos.resultados.fecha}: {formatearFecha(documento.fecha)}
                            </Typography>
                            <BotonDescarga
                                documento={documento}
                                etiqueta={etiqueta}
                                ariaLabel={ariaLabel}
                                nombreArchivo={nombreArchivo}
                                onDescargar={onDescargar}
                                onRenovarUrl={onRenovarUrl}
                            />
                        </Box>
                    ))}
                </Stack>

                {ayuda && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        {ayuda}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
