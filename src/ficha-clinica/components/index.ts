// Componentes de presentación
export { PacienteHeader } from './PacienteHeader';
export { KpiCard } from './KpiCard';
export { ChartCard } from './ChartCard';
export { AntecedentesCard } from './AntecedentesCard';
export { EmptyState } from './EmptyState';
export { Bloque, Dato } from './DetalleCampos';

// Filas de tabla con detalle expandible
export { BioimpedanciaRow } from './BioimpedanciaRow';
export { ElectroRow } from './ElectroRow';

// Tabs de la ficha clínica
export { TabHome } from './tabs/TabHome';
export { TabBioimpedancias } from './tabs/TabBioimpedancias';
export { TabElectrocardiogramas } from './tabs/TabElectrocardiogramas';
export { TabDistribucionSegmentaria } from './tabs/TabDistribucionSegmentaria';

// Gráficos (react-chartjs-2)
export {
    PesoImcChart,
    PresionChart,
    SaturacionFcChart,
    HemoglucotestChart,
    EstadoNutricionalChart,
} from './charts';

// Distribución segmentaria (silueta SVG)
export { SiluetaCorporal } from './segmentaria/SiluetaCorporal';
export { ControlesSegmentaria } from './segmentaria/ControlesSegmentaria';
export { CalloutSegmento } from './segmentaria/CalloutSegmento';
export { DetalleSegmento } from './segmentaria/DetalleSegmento';
export { PanelElectro } from './segmentaria/PanelElectro';
export { GuiasCallout } from './segmentaria/svg/GuiasCallout';
export { MarcadoresElectro } from './segmentaria/svg/MarcadoresElectro';
export { CuerpoDefs } from './segmentaria/svg/CuerpoDefs';
export {
    ESTADOS,
    COLOR_ESTADO,
    COLOR_ESTADO_CLARO,
    ETIQUETA_ESTADO,
} from './segmentaria/paleta';
