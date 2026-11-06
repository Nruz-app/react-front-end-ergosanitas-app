import { Route, Routes } from 'react-router-dom';

// La página SEO del ECG se reutiliza tal cual desde el módulo anterior (solo se importa su lazy).
import { AppElectrocardiogramaPage } from '../../Servicios/SEO';
import { CartFlowProvider } from '../context';
import { CotizarPage } from './cotizar-page';
import { ResultadoPage } from './resultado-page';
import { ServicioCartFlowPage } from './servicio-cart-flow-page';

/**
 * Subrutas de `/servicios/*` (Spec 01 de `servicio-cart-flow`). Reemplaza a
 * `Servicios/pages/AppServiciosPage`, que queda intacta como vía de reversa.
 */
const AppServicioCartFlowPage = () => (

    <CartFlowProvider>
        <Routes>
            <Route path="/" element={<ServicioCartFlowPage />} />
            <Route path="resultado" element={<ResultadoPage />} />
            <Route path="cotizar" element={<CotizarPage />} />
            <Route path="electrocardiograma" element={<AppElectrocardiogramaPage />} />
        </Routes>
    </CartFlowProvider>
);

export default AppServicioCartFlowPage;
