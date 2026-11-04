import { Box, Typography } from '@mui/material';

import { ChequeoForm, ChequeoFormUpdate, ElectroCardiogramaForm } from '../components';
import { TITULOS_FICHA } from '../config/ficha';
import type { SeleccionFicha } from '../interface';

interface Props {
    seleccion  : SeleccionFicha;
    /**
     * Si el tab está a la vista. `TabPanel` oculta sin desmontar: sin esta señal el selector de
     * club pediría la lista nada más entrar al módulo (§4, carga diferida).
     */
    activo     : boolean;
    onGuardado : () => void;
}

/**
 * Tab 1 del módulo: alta, edición o revisión médica de un chequeo, según `seleccion.modo`
 * (`ModoFicha`, en `interface/ficha.interface.ts`).
 *
 * Reúne `pages/Chequeo.tsx` y `pages/ElectroCardiograma.tsx` del módulo viejo, sin sus
 * `ml={15} mt={8}` fijos (§6.2), que con el rail ancho empujarían el formulario fuera de la
 * tarjeta. El `key` remonta el formulario al cambiar de chequeo, para no arrastrar valores.
 */
export const FichaChequeoPage = ({ seleccion, activo, onGuardado }: Props) => {

    const { modo, rut_paciente, id_paciente, url_pdf } = seleccion;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography
                component="h2"
                variant="h4"
                align="center"
                sx={{
                    fontWeight    : 'bold',
                    letterSpacing : '0.1rem',
                    textTransform : 'uppercase',
                    color         : 'primary.main',
                    fontSize      : { xs: 20, md: 30 },
                    mb            : 3,
                }}
            >
                { TITULOS_FICHA[modo] }
            </Typography>

            {modo === 'alta' && (
                <ChequeoForm key="alta" activo={activo} onGuardado={onGuardado} />
            )}

            {modo === 'edicion' && (
                <ChequeoFormUpdate
                    key={`edicion-${id_paciente}`}
                    id_paciente={id_paciente}
                    activo={activo}
                    onGuardado={onGuardado}
                />
            )}

            {modo === 'revision' && (
                <ElectroCardiogramaForm
                    key={`revision-${id_paciente}`}
                    rut_paciente={rut_paciente}
                    id_paciente={id_paciente}
                    url_pdf={url_pdf}
                    onGuardado={onGuardado}
                />
            )}
        </Box>
    );
};
