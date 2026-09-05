import { Box, Grid } from '@mui/material';

import {
    AsistenteColegio, BarPresion, ListaAlterados, PieChartHemoglucotest, PieChartImc,
    PieChartSaturacion, PiramideEdadSexo, SeccionHome, StatisticsGlobal,
} from '../components';
import { useResumenColegio } from '../hooks';

/**
 * Home del colegio: los contadores arriba, la lista de deportistas alterados, y debajo los
 * indicadores clínicos agregados.
 *
 * La lista va primero y sola en su sección porque es **lo único accionable** de la pantalla: el
 * resto describe a la población, ella nombra a quien hay que atender. Ocupó el sitio de los
 * gráficos «Avance por etapa» y «Avance por curso», que decían cuántos había —dato que los
 * contadores ya dan— y que además no funcionaban: `chequeo-all` no devuelve `division_paciente`,
 * así que el de curso pintaba los 118 deportistas en una sola barra «Sin curso».
 *
 * Las dos fuentes de datos conviven: la lista, la pirámide y la saturación se derivan **en el
 * front** de `chequeo-all`; el IMC, el hemoglucotest y la presión vienen de `estadisticas/*`.
 * La saturación cambió de bando porque su endpoint devuelve 500 y el dato ya venía en el listado.
 * Por eso cada tarjeta derivada declara sobre cuántos deportistas está calculada, y una
 * discrepancia con los contadores de arriba queda a la vista en vez de escondida.
 *
 * Esta página es la única que hace fetch del resumen: `useResumenColegio` se llama **una vez** y
 * lo derivado baja por props. Los tres gráficos que siguen viniendo del backend sí piden lo suyo
 * cada uno, porque cada uno consulta un endpoint distinto.
 *
 * El asistente (Spec 03) va **entre los contadores y la lista**: ocupa el lugar del botón
 * «Detalle clínico» que se retiró, y es lo único de la pantalla que responde una pregunta que
 * nadie anticipó al diseñar un gráfico. No hace fetch al montarse — ver `AsistenteColegio`.
 */

interface Props {
    /**
     * `true` mientras el tab Home está a la vista.
     *
     * Solo baja hasta `AsistenteColegio`, para cerrar el micrófono al cambiar de tab:
     * `TabPanel` oculta con `display: none` y nunca desmonta. No se usa para nada más — el
     * resto del Home puede seguir montado sin coste.
     */
    activo?: boolean;
}

export const HomePage = ({ activo = true }: Props) => {

    const { resumen, cargado, error } = useResumenColegio();

    return (
        <Box>
            <StatisticsGlobal />

            <SeccionHome
                titulo="Asistente Ergo"
                descripcion="Consulta asistida sobre los deportistas de tu colegio."
            >
                <AsistenteColegio activo={activo} />
            </SeccionHome>

            <SeccionHome
                titulo="Requiere atención"
                descripcion="Deportistas con diagnóstico cardíaco alterado, del más reciente al más antiguo."
            >
                <ListaAlterados
                    alterados={resumen.alterados}
                    cargado={cargado}
                    error={error}
                    totalFilas={resumen.totalFilas}
                />
            </SeccionHome>

            <SeccionHome
                titulo="Salud de los deportistas"
                descripcion="Resultados clínicos agregados de los chequeos realizados."
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={3}><PieChartImc /></Grid>
                    <Grid item xs={12} sm={6} lg={3}><PieChartHemoglucotest /></Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <PieChartSaturacion
                            serie={resumen.porSaturacion}
                            cargado={cargado}
                            error={error}
                            totalFilas={resumen.totalFilas}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}><BarPresion /></Grid>
                    <Grid item xs={12}>
                        <PiramideEdadSexo
                            serie={resumen.porEdadSexo}
                            cargado={cargado}
                            error={error}
                            totalFilas={resumen.totalFilas}
                        />
                    </Grid>
                </Grid>
            </SeccionHome>
        </Box>
    );
};
