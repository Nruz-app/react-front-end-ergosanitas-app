/**
 * Traductor de nombre de icono a componente de MUI.
 *
 * Existe porque `home-servicios.json` no puede contener un componente de React: guarda
 * el **nombre** del icono como string y este mapa lo resuelve en tiempo de render.
 *
 * La consecuencia práctica es que agregar un servicio con un icono nuevo son dos
 * ediciones, no una: la entrada en el JSON y una línea aquí. Es el precio de que el
 * contenido viva en JSON, y se paga solo cuando aparece un icono que todavía no está.
 *
 * Los iconos se importan uno a uno por su ruta (`@mui/icons-material/MonitorHeart`) y no
 * desde el barril del paquete. Es la convención que ya usa `src/routes/Navigation.tsx`, y
 * además evita arrastrar al bundle los miles de iconos que trae la librería.
 */

import SvgIcon from '@mui/material/SvgIcon';

import MonitorHeartIcon    from '@mui/icons-material/MonitorHeart';
import FavoriteBorderIcon  from '@mui/icons-material/FavoriteBorder';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import WatchLaterIcon      from '@mui/icons-material/WatchLater';
import ScienceIcon         from '@mui/icons-material/Science';
import VaccinesIcon        from '@mui/icons-material/Vaccines';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon   from '@mui/icons-material/LocalHospital';

/**
 * Tipo de un icono de MUI.
 *
 * Se deriva de `typeof SvgIcon` porque `@mui/icons-material` declara internamente
 * `SvgIconComponent` pero **no lo exporta**: importarlo desde ahí no compila.
 */
export type IconoHome = typeof SvgIcon;

/**
 * Icono que se usa cuando el JSON trae un nombre que no está en el mapa.
 *
 * Es deliberadamente genérico y del mismo dominio: un typo en el JSON degrada el icono,
 * no rompe la página.
 */
export const ICONO_POR_DEFECTO: IconoHome = LocalHospitalIcon;

/** Nombres reconocidos en el campo `icono` de `home-servicios.json`. */
const ICONOS: Record<string, IconoHome> = {
    MonitorHeart     : MonitorHeartIcon,
    FavoriteBorder   : FavoriteBorderIcon,
    AccessibilityNew : AccessibilityNewIcon,
    WatchLater       : WatchLaterIcon,
    Science          : ScienceIcon,
    Vaccines         : VaccinesIcon,
    MedicalServices  : MedicalServicesIcon,
    LocalHospital    : LocalHospitalIcon,
};

/**
 * Devuelve el componente de icono para un nombre del JSON.
 *
 * Nunca lanza ni devuelve `undefined`: un nombre desconocido cae a
 * `ICONO_POR_DEFECTO`. Un error de tipeo en un archivo de contenido no debe tumbar la
 * portada del sitio.
 */
export const resolverIcono = ( nombre: string ): IconoHome => ICONOS[ nombre ] ?? ICONO_POR_DEFECTO;
