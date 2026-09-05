import { Box, Typography } from '@mui/material';

interface Props {
    items: { nombre: string; color: string; valor: number }[];
}

/**
 * Leyenda propia de las donas, en lugar de la de `chart.js`.
 *
 * Dos razones. La primera es funcional: con la leyenda dentro del canvas, el anillo se
 * descentra y el total del medio deja de caer donde debe. La segunda es que esta leyenda dice
 * más — cada entrada lleva su cantidad y su porcentaje, que en un segmento de dona hay que
 * adivinar a ojo.
 */
export const LeyendaGrafico = ({ items }: Props) => {

    const total = items.reduce((suma, item) => suma + item.valor, 0);

    return (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.5 }}>
            { items.map(({ nombre, color, valor }) => (
                <Box
                    component="li"
                    key={nombre}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                >
                    <Box
                        aria-hidden="true"
                        sx={{
                            width        : 10,
                            height       : 10,
                            borderRadius : '3px',
                            flexShrink   : 0,
                            backgroundColor : color,
                        }}
                    />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', flex: 1, minWidth: 0 }}>
                        { nombre }
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
                        { valor }
                        <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', ml: 0.5 }}>
                            ({ total > 0 ? Math.round((valor / total) * 100) : 0 }%)
                        </Box>
                    </Typography>
                </Box>
            )) }
        </Box>
    );
};
