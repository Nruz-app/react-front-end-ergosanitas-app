import { ReactElement, SyntheticEvent, useState } from 'react';
import { Box, IconButton, Tab, Tabs, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import { getLocalStorage, setLocalStorage } from '../../../common/services/local-storage/storage.service';
import { COLORES, DEGRADADOS, SOMBRAS, sxFocoVisible } from '../../config/tema';

/** Un tab del rail. `indice` es la constante `TAB_*`, nunca un literal. */
export interface ItemRail {
    indice : number;
    titulo : string;
    icono  : ReactElement;
}

interface Props {
    tabs     : ItemRail[];
    value    : number;
    onChange : (event: SyntheticEvent, nuevoTab: number) => void;
}

/** Clave de localStorage con la preferencia «rail contraído» del Administrador. */
const CLAVE_CONTRAIDO = 'admin_rail_contraido';

/** Id del `Tabs`, para el `aria-controls` del botón de contraer. */
const ID_RAIL = 'admin-rail-tabs';

/**
 * Rail vertical de tabs **con etiqueta visible** (§6.1): la única mejora visual de la Spec 01.
 *
 * Tres modos:
 *
 * - **≥ 900 px (`md`), expandido**: ~232 px, icono y texto en una línea, alineados a la izquierda.
 * - **≥ 900 px, contraído**: 64 px, solo icono, para que el cuerpo (la tabla, la grilla de
 *   imágenes) gane ancho. Lo elige el usuario con el botón de arriba y se recuerda en localStorage
 *   (`admin_rail_contraido`); si el almacenamiento falla, el botón funciona igual sin recordar.
 * - **< 900 px**: 64 px, solo icono, siempre; el botón no se muestra porque no haría nada.
 *
 * Contraído, el nombre de cada tab va en `aria-label` y `title`. El rail no desaparece.
 *
 * Diferencias con el rail de hoy, a propósito:
 *
 * - **Sin `Tooltip` envolviendo al `Tab`**: `Tabs` inyecta sus props a sus hijos directos, y con
 *   el `Tooltip` en medio funcionaba por accidente.
 * - **Sin `transform: scale(1.15)` al pasar por encima**: agrandaba el tab y desplazaba a los
 *   vecinos. Se conserva el cambio de fondo, y `prefers-reduced-motion` quita la transición.
 * - **Cada `Tab` lleva `value={indice}` explícito**: si mañana se intercala un separador, no se
 *   corre ningún índice.
 * - Tabs más bajos (52 px en vez de 75): con 75 los 7 no cabían en 900 px de alto y el último
 *   quedaba medio oculto.
 */
export const RailTabs = ({ tabs, value, onChange }: Props) => {

    const theme = useTheme();
    const esAncho = useMediaQuery(theme.breakpoints.up('md'));

    const [contraido, setContraido] = useState<boolean>(() => getLocalStorage(CLAVE_CONTRAIDO) === true);

    const conEtiqueta = esAncho && !contraido;

    const alternar = () => {

        const nuevo = !contraido;
        setContraido(nuevo);

        // `setLocalStorage` no es defensivo: en modo privado o con el almacenamiento bloqueado lanza.
        try {
            setLocalStorage(CLAVE_CONTRAIDO, nuevo);
        }
        catch {
            // Sin almacenamiento la preferencia no se recuerda, pero el rail se contrae igual.
        }
    };

    return (
        <Box
            sx={{
                flexShrink    : 0,
                display       : 'flex',
                flexDirection : 'column',
                width         : conEtiqueta ? 232 : 64,
                borderRight   : `1px solid ${COLORES.borde}`,
                bgcolor       : COLORES.fondoRail,
                transition    : 'width 0.2s ease',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            { esAncho && (
                <Box sx={{ display: 'flex', justifyContent: contraido ? 'center' : 'flex-end', px: 1, pt: 1 }}>
                    <Tooltip title={contraido ? 'Expandir menú' : 'Contraer menú'} placement="right">
                        <IconButton
                            size="small"
                            onClick={alternar}
                            aria-label={contraido ? 'Expandir menú' : 'Contraer menú'}
                            aria-expanded={!contraido}
                            aria-controls={ID_RAIL}
                            sx={{ color: COLORES.textoSuave, ...sxFocoVisible }}
                        >
                            { contraido ? <MenuIcon /> : <MenuOpenIcon /> }
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <Tabs
                id={ID_RAIL}
                orientation="vertical"
                variant="scrollable"
                scrollButtons={false}
                value={value}
                onChange={onChange}
                aria-label="Secciones del chequeo del administrador"
                sx={{
                    pt          : esAncho ? 0 : 1,

                    '& .MuiTabs-indicator': { display: 'none' },

                    '& .MuiTab-root': {
                        minHeight      : 52,
                        minWidth       : 0,
                        mx             : 1,
                        my             : 0.5,
                        px             : conEtiqueta ? 1.5 : 0,
                        borderRadius   : '14px',
                        color          : COLORES.textoSuave,
                        textTransform  : 'none',
                        fontWeight     : 600,
                        fontSize       : 14,
                        justifyContent : conEtiqueta ? 'flex-start' : 'center',
                        textAlign      : 'left',
                        whiteSpace     : 'nowrap',
                        transition     : 'background 0.2s ease, color 0.2s ease',
                        '& .MuiSvgIcon-root' : { fontSize: 24 },
                        '&:hover'            : { background: DEGRADADOS.hover, color: COLORES.textoSobrePrimario },
                        ...sxFocoVisible,
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    },

                    '& .Mui-selected': {
                        background : DEGRADADOS.primario,
                        color      : `${COLORES.textoSobrePrimario} !important`,
                        boxShadow  : SOMBRAS.seleccion,
                    },
                }}
            >
                {tabs.map(({ indice, titulo, icono }) => (
                    <Tab
                        key={indice}
                        value={indice}
                        icon={icono}
                        iconPosition="start"
                        label={conEtiqueta ? titulo : undefined}
                        aria-label={titulo}
                        title={conEtiqueta ? undefined : titulo}
                        id={`admin-tab-${indice}`}
                        aria-controls={`admin-tabpanel-${indice}`}
                    />
                ))}
            </Tabs>
        </Box>
    );
};
