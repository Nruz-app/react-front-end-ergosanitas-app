import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper } from '@mui/material';

import { FormCotizacion } from '../components';
import { COLORES, FONDO_PAGINA } from '../config/tema';
import { mostrarError } from '../utilities';
import type { ICotizacionForm } from '../interface';
import { UseCartFlowService } from '../services';

/** `/servicios/cotizar?comuna=&sku=&servicio=`: solicitud de cotización precargada. */
export const CotizarPage = () => {

    const [query] = useSearchParams();
    const navigate = useNavigate();

    const [cargando, setCargando] = useState<boolean>(false);
    const [enviado, setEnviado] = useState<boolean>(false);

    const enviar = async (form: ICotizacionForm) => {

        setCargando(true);

        try {
            await (await UseCartFlowService()).cotizar(form);
            setEnviado(true);
        }
        catch (problema) {
            mostrarError(problema);
        }
        finally {
            setCargando(false);
        }
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', minHeight: '100vh', p: { xs: 2, md: 4 }, background: FONDO_PAGINA }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 6, background: COLORES.fondoPanel }}>
                <FormCotizacion
                    inicial={{
                        comuna: query.get('comuna') ?? '',
                        sku: query.get('sku') ?? '',
                        servicio: query.get('servicio') ?? '',
                    }}
                    cargando={cargando}
                    enviado={enviado}
                    onEnviar={enviar}
                    onVolver={() => navigate('/servicios')}
                />
            </Paper>
        </Box>
    );
};

export default CotizarPage;
