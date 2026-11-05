import { useContext, useState } from 'react';
import { Alert, Box, Paper, Tab, Tabs, Typography } from '@mui/material';

import { LoginContext } from '../../common/context';
import { PESTANAS } from '../config/textos';
import { COLORES } from '../config/tema';
import { CatalogoPanel } from './catalogo-panel';
import { CotizacionesPanel } from './cotizaciones-panel';
import { PedidosPanel } from './pedidos-panel';

/**
 * Mantenedor «Carrito Compra» del Administrador (Spec 01 de `carrito-compra`, SPEC 05 del back).
 * El back exige el `user_email` de la sesión con perfil Administrador en cada llamada.
 */
const AppCarritoCompraPage = () => {

    const { user } = useContext(LoginContext);
    const [pestana, setPestana] = useState<number>(0);
    const userEmail = user?.user_email ?? '';

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', minHeight: '100vh', p: { xs: 2, md: 4 }, background: COLORES.fondoApp }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: `1px solid ${COLORES.borde}` }}>

                <Typography variant="h5" fontWeight="bold" color={COLORES.primarioOsc}>Carrito Compra</Typography>
                <Typography variant="body2" color={COLORES.textoSuave} sx={{ mb: 2 }}>
                    Pedidos, pagos y cotizaciones que llegan por /servicios.
                </Typography>

                {!userEmail ? (
                    <Alert severity="warning">Inicia sesión como Administrador para ver el carro de compras.</Alert>
                ) : (
                    <>
                        <Tabs value={pestana} onChange={(_, v) => setPestana(v)} textColor="inherit"
                            sx={{ mb: 3, '& .MuiTabs-indicator': { background: COLORES.primario }, '& .Mui-selected': { color: COLORES.primarioOsc, fontWeight: 700 } }}>
                            {PESTANAS.map((p) => <Tab key={p} label={p} />)}
                        </Tabs>

                        {pestana === 0 && <PedidosPanel userEmail={userEmail} />}
                        {pestana === 1 && <CotizacionesPanel userEmail={userEmail} />}
                        {pestana === 2 && <CatalogoPanel userEmail={userEmail} />}
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default AppCarritoCompraPage;
