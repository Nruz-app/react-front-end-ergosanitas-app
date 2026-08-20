import { ReactNode } from 'react';
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';

interface Props {
    titulo: string;
    subtitulo?: string;
    children: ReactNode;
    // Alto del área del gráfico.
    height?: number;
}

/**
 * Envoltura reutilizable para cada gráfico, con la estética de los Cards
 * de Estadísticas (bordes redondeados, sombra, cabecera con título).
 */
export const ChartCard = ({ titulo, subtitulo, children, height = 300 }: Props) => {
    return (
        <Card
            sx={{
                borderRadius: 6,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                backgroundColor: 'white',
                height: '100%',
            }}
        >
            <CardHeader
                title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.3px' }}>
                        {titulo}
                    </Typography>
                }
                subheader={
                    subtitulo && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {subtitulo}
                        </Typography>
                    )
                }
            />
            <CardContent>
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 4,
                        height,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ChartCard;
