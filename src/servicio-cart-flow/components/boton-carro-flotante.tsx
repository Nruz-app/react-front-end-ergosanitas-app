import { useEffect, useRef, useState } from 'react';
import { Badge, Box, Fab, Portal, Zoom, keyframes } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { COLORES } from '../config/tema';
import { formatoClp } from '../utilities';

interface Props {
    cantidad      : number;
    total         : number;
    deshabilitado : boolean;
    onClick       : () => void;
}

const pulso = keyframes`
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    100% { transform: scale(1); }
`;

/**
 * «Ver carro» flotante del paso Catálogo: fijo abajo a la derecha (centrado en móvil) para no
 * tener que bajar hasta el final de la grilla. Aparece con la primera línea (vacío taparía las
 * tarjetas sin ofrecer nada) y late una vez cada vez que cambia la cantidad.
 */
export const BotonCarroFlotante = ({ cantidad, total, deshabilitado, onClick }: Props) => {

    const [latiendo, setLatiendo] = useState<boolean>(false);
    const anterior = useRef<number>(cantidad);

    useEffect(() => {

        if (cantidad === anterior.current) return;

        anterior.current = cantidad;
        setLatiendo(true);

        const id = window.setTimeout(() => setLatiendo(false), 450);

        return () => window.clearTimeout(id);
    }, [cantidad]);

    const vacio = cantidad === 0;

    // Portal al <body>: el panel de la página usa backdropFilter, que convierte a cualquier hijo
    // `position: fixed` en relativo al panel y no a la ventana.
    return (
        <Portal>
            <Zoom in={!vacio} unmountOnExit>
                <Fab
                    variant="extended"
                    onClick={onClick}
                    disabled={deshabilitado}
                    aria-label={`Ver carro: ${cantidad} productos, total ${formatoClp(total)}`}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: { xs: 16, sm: 24 },
                        left: { xs: 16, sm: 'auto' },
                        zIndex: (theme) => theme.zIndex.speedDial,
                        px: 3,
                        gap: 1.5,
                        fontWeight: 'bold',
                        background: COLORES.navy,
                        color: COLORES.blanco,
                        boxShadow: `0 10px 25px ${COLORES.sombraTarjeta}`,
                        animation: latiendo ? `${pulso} 0.45s ease-out` : 'none',
                        '&:hover': { background: COLORES.navyHover },
                        '&.Mui-disabled': { background: COLORES.navy, color: COLORES.blanco, opacity: 0.7 },
                    }}
                >
                    <Badge badgeContent={cantidad} color="success" showZero={false}>
                        <ShoppingCartIcon />
                    </Badge>
                    <Box component="span">Ver carro</Box>
                    <Box component="span" sx={{ opacity: 0.9 }}>· {formatoClp(total)}</Box>
                </Fab>
            </Zoom>
        </Portal>
    );
};
