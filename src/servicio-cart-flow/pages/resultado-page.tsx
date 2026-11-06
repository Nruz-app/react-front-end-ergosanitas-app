import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Paper } from '@mui/material';

import { ConfirmacionPedido } from '../components';
import { COLORES, FONDO_PAGINA } from '../config/tema';
import { useCartFlow } from '../context';
import type { IPedido } from '../interface';
import { UseCartFlowService } from '../services';

/**
 * Vuelta de Webpay: `/servicios/resultado?pago=…&pedido=…&t=…`. El back ya confirmó (o no) la
 * transacción; aquí solo se lee el pedido con su token y se ofrece reintentar si no se pagó.
 */
export const ResultadoPage = () => {

    const [query] = useSearchParams();
    const navigate = useNavigate();
    const { pagarWebPay, cargando, reiniciar } = useCartFlow();

    const numero = query.get('pedido');
    const token = query.get('t');
    const pago = query.get('pago');

    const [pedido, setPedido] = useState<IPedido | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {

        if (!numero || !token) {
            setError(pago === 'error' ? 'No pudimos confirmar el pago. Si se descontó de tu cuenta, escríbenos.' : 'Falta el número de pedido.');
            return;
        }

        const cargar = async () => {
            try {
                setPedido(await (await UseCartFlowService()).getPedido(numero, token));
            }
            catch (problema) {
                setError(problema instanceof Error ? problema.message : 'No se encontró el pedido');
            }
        };

        cargar();
    }, [numero, token, pago]);

    const volver = () => {
        reiniciar();
        navigate('/servicios');
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', minHeight: '100vh', p: { xs: 2, md: 4 }, background: FONDO_PAGINA }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 6, background: COLORES.fondoPanel }}>
                {error && (
                    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        <Button variant="outlined" onClick={volver}>Volver a servicios</Button>
                    </Box>
                )}

                {!error && !pedido && <Box textAlign="center" sx={{ py: 8 }}><CircularProgress /></Box>}

                {pedido && (
                    <ConfirmacionPedido
                        pedido={pedido}
                        resultado={pago}
                        cargando={cargando}
                        onPagar={() => token && pagarWebPay({ ...pedido, token_consulta: token })}
                        onNuevo={volver}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default ResultadoPage;
