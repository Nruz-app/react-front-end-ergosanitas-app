import { Button, Card, CardActions, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';

import { COLORES, FONDO_TARJETA, UI } from '../config/tema';
import type { IProducto, PlanCarro } from '../interface';
import { formatoClp } from '../utilities';

interface Props {
    producto    : IProducto;
    plan        : PlanCarro;
    enCarro     : boolean;
    deshabilitado: boolean;
    onAgregar   : () => void;
    onCotizar   : () => void;
}

/** Precio de lista y, si el plan del carro tiene precio propio, el precio con plan. */
const precioPlan = (producto: IProducto, plan: PlanCarro): number | null => {
    if (plan === 'te_cuida') return producto.precio_te_cuida;
    if (plan === 'familiar') return producto.precio_familiar;
    return null;
};

export const ProductoCard = ({ producto, plan, enCarro, deshabilitado, onAgregar, onCotizar }: Props) => {

    const conPlan = precioPlan(producto, plan);

    return (
        <Card sx={{
            height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4,
            background: FONDO_TARJETA, color: COLORES.blanco,
            boxShadow: `0 10px 25px ${COLORES.sombraTarjeta}`,
            transition: 'transform 0.2s ease', '&:hover': { transform: 'translateY(-4px)' },
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {producto.nombre}
                </Typography>

                {producto.descripcion_publica && (
                    <Typography variant="body2" sx={{ opacity: 0.92, mb: 2 }}>
                        {producto.descripcion_publica}
                    </Typography>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {!producto.solo_cotizacion && (
                        <Chip size="small" label={formatoClp(conPlan ?? producto.precio)}
                            sx={{ background: UI.precioFondo, color: UI.precioTexto, fontWeight: 'bold' }} />
                    )}
                    {conPlan !== null && conPlan !== producto.precio && (
                        <Chip size="small" label={`Normal ${formatoClp(producto.precio)}`}
                            sx={{ background: COLORES.bordePanel, color: COLORES.blanco, textDecoration: 'line-through' }} />
                    )}
                    {producto.precio_adulto_mayor !== null && (
                        <Chip size="small" label={`${producto.edad_min_beneficio ?? 60}+ años: ${formatoClp(producto.precio_adulto_mayor)}`}
                            sx={{ background: COLORES.bordePanel, color: COLORES.blanco }} />
                    )}
                    {producto.requiere_ayuno && (
                        <Chip size="small" label={`Ayuno ${producto.horas_ayuno || 8} h`} sx={{ background: UI.alertaFondo, color: UI.alerta }} />
                    )}
                    {producto.requiere_orden_medica && (
                        <Tooltip title="Al pagar te pediremos la orden médica (PDF o foto)">
                            <Chip size="small" label="Orden médica" sx={{ background: UI.infoFondo, color: UI.info }} />
                        </Tooltip>
                    )}
                    {(producto.edad_min !== null || producto.edad_max !== null) && (
                        <Chip size="small"
                            label={producto.edad_max !== null ? `${producto.edad_min ?? 0}–${producto.edad_max} años` : `Desde ${producto.edad_min} años`}
                            sx={{ background: COLORES.bordePanel, color: COLORES.blanco }} />
                    )}
                </Stack>

                {producto.preparacion && (
                    <Typography variant="caption" component="p" sx={{ mt: 2, opacity: 0.9 }}>
                        <strong>Preparación:</strong> {producto.preparacion}
                    </Typography>
                )}
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                {producto.solo_cotizacion ? (
                    <Button fullWidth variant="contained" onClick={onCotizar}
                        sx={{ borderRadius: 3, fontWeight: 'bold', background: COLORES.navy, '&:hover': { background: COLORES.navyHover } }}>
                        Solicitar cotización
                    </Button>
                ) : (
                    <Button fullWidth variant="contained" onClick={onAgregar} disabled={deshabilitado}
                        startIcon={enCarro ? <CheckIcon /> : <AddShoppingCartIcon />}
                        sx={{ borderRadius: 3, fontWeight: 'bold', background: COLORES.navy, '&:hover': { background: COLORES.navyHover } }}>
                        {enCarro ? 'En el carro · agregar otro' : 'Agregar al carro'}
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};
