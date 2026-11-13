import { useEffect, useRef, useState } from 'react';
import { Box, Container, Fade, Grid, Typography } from '@mui/material';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';

import { MarqueeHome } from '../../Home/components';
import { BannerOfertas, BuscadorRut, EstadoResultado, TarjetaDocumentos } from '../components';
import { useOfertasBanner } from '../hooks';
import { UseCertificadoService } from '../services/useCertificadoService';
import type { ICertificadosConsulta, IOfertaBanner, TipoDocumento } from '../interface';
import { botonesDe, esperar, mensajeDelError, prefiereMenosMovimiento } from '../utilities';
import configuracionBanner from '../config/banner-ofertas.json';
import textos from '../config/textos-certificados.json';

type Estado = 'inicial' | 'cargando' | 'ok' | 'vacio' | 'error';

/** Lo que pinta el banner durante una búsqueda, fijado al empezarla (D8 de la SPEC 02). */
interface BannerDeBusqueda {
    ofertas       : IOfertaBanner[];
    indiceInicial : number;
}

/**
 * Oculta a la vista sin ocultar al lector de pantalla. Mientras carga, la región `status` dice
 * «Buscando documentos…»; en pantalla ese texto ya lo pone el spinner o la etiqueta del banner
 * (D9). No se usa `visuallyHidden` de `@mui/utils`: no está declarado en `package.json`.
 */
const sxSoloLectores = {
    position   : 'absolute',
    width      : '1px',
    height     : '1px',
    p          : 0,
    m          : '-1px',
    overflow   : 'hidden',
    clip       : 'rect(0 0 0 0)',
    whiteSpace : 'nowrap',
    border     : 0,
} as const;

/** Resumen corto que anuncia la región `role="status"` al empezar y al terminar una búsqueda. */
const resumenDe = (estado: Estado, cantidad: number): string => {

    if (estado === 'cargando') return textos.resultados.cargando;

    if (estado === 'ok') {
        return cantidad === 1
            ? textos.resultados.resumenUno
            : textos.resultados.resumenVarios.replace('{n}', String(cantidad));
    }

    if (estado === 'vacio') return textos.resultados.resumenVacio;
    if (estado === 'error') return textos.resultados.resumenError;

    return '';
};

/**
 * Página pública «Descargar certificados» (SPEC 01 de certificados).
 *
 * Una sola petición por búsqueda (`POST certificados/consulta`) y estado local con `useState`.
 * `busquedaVigente` numera cada búsqueda: una respuesta que llega cuando ya hay otra búsqueda
 * (o se limpió el buscador) se descarta, tanto en `buscar` como en `renovarUrl`.
 *
 * Mientras busca, en lugar del spinner muestra el banner de ofertas si estaba listo al empezar
 * (SPEC 02 de certificados). Las ofertas se piden al montar, no al buscar (D1): si se pidieran al
 * buscar, llegarían junto con los resultados y el banner no se vería nunca.
 */
export const CertificadoPage = () => {

    const [estado, setEstado] = useState<Estado>('inicial');
    const [resultado, setResultado] = useState<ICertificadosConsulta | null>(null);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [banner, setBanner] = useState<BannerDeBusqueda | null>(null);
    const [reducirMovimiento] = useState(prefiereMenosMovimiento);

    const { ofertas, estado: estadoOfertas, indiceInicial, rotarInicial } = useOfertasBanner();

    const busquedaVigente = useRef(0);
    const rutBuscado = useRef('');
    const tituloResultados = useRef<HTMLHeadingElement>(null);

    // Al terminar una búsqueda, el foco va al título de resultados (lectores de pantalla y teclado).
    useEffect(() => {
        if (estado === 'ok' || estado === 'vacio' || estado === 'error') {
            tituloResultados.current?.focus();
        }
    }, [estado]);

    const buscar = async (rut: string) => {

        const busqueda = ++busquedaVigente.current;

        // D8: banner o spinner se decide aquí y no cambia hasta que termina la búsqueda. Se guarda
        // una instantánea: si `rotarInicial` o una oferta rota cambian la lista a mitad de la
        // búsqueda, el carrusel que se está viendo no se toca.
        const conBanner = estadoOfertas === 'listo' && ofertas.length > 0;

        rutBuscado.current = rut;
        setBanner(conBanner ? { ofertas, indiceInicial } : null);
        setEstado('cargando');
        setMensajeError(null);

        // P1: con banner, la búsqueda dura al menos `permanenciaMinimaMs`, aunque la API responda
        // antes o falle (`allSettled`: un error también espera, para que el banner no corte en
        // seco). Sin banner no hay espera: el spinner se comporta como antes de la SPEC 02.
        const [consulta] = await Promise.allSettled([
            UseCertificadoService().then(({ consultarDocumentos }) => consultarDocumentos(rut)),
            conBanner ? esperar(configuracionBanner.permanenciaMinimaMs) : Promise.resolve(),
        ]);

        // Se comprueba después de la espera. Hoy no puede haber otra búsqueda ni un «Limpiar» en
        // medio (BuscadorRut deshabilita ambos mientras carga), pero si eso cambia, esta respuesta
        // se descarta igual que antes de la SPEC 02.
        if (busqueda !== busquedaVigente.current) return;

        // P4: la próxima búsqueda arranca con otra oferta, ya precargada.
        if (conBanner) rotarInicial();

        if (consulta.status === 'fulfilled') {
            setResultado(consulta.value);
            setEstado(consulta.value.documentos.length > 0 ? 'ok' : 'vacio');
            return;
        }

        setResultado(null);
        setMensajeError(mensajeDelError(consulta.reason));
        setEstado('error');
    };

    const limpiar = () => {
        busquedaVigente.current++;
        rutBuscado.current = '';
        setResultado(null);
        setMensajeError(null);
        setEstado('inicial');
    };

    /**
     * Rehace la consulta con el RUT del resultado vigente (no con el texto del buscador, que el
     * usuario puede haber cambiado) y devuelve la URL firmada nueva de ese tipo. Si mientras tanto
     * hubo otra búsqueda, descarta la respuesta y devuelve null.
     */
    const renovarUrl = async (tipo: TipoDocumento): Promise<string | null> => {

        const busqueda = busquedaVigente.current;
        const rut = resultado?.rut ?? rutBuscado.current;

        const { consultarDocumentos } = await UseCertificadoService();
        const data = await consultarDocumentos(rut);

        if (busqueda !== busquedaVigente.current) return null;

        setResultado(data);

        if (data.documentos.length === 0) {
            setEstado('vacio');
            return null;
        }

        return data.documentos.find((documento) => documento.tipo === tipo)?.url ?? null;
    };

    const descargar = async (url: string): Promise<Blob> => {

        const { descargarDocumento } = await UseCertificadoService();

        return descargarDocumento(url);
    };

    const botonesChequeo = resultado
        ? botonesDe(resultado, ['certificado_ecg', 'ecg'], textos.tarjetas.chequeo, 'Certificado')
        : [];

    const botonesBio = resultado
        ? botonesDe(resultado, ['certificado_bio', 'bio'], textos.tarjetas.bioimpedancia, 'Certificado-Bioimpedancia')
        : [];

    const resumen = resumenDe(estado, resultado?.documentos.length ?? 0);

    return (
        <>
            <MarqueeHome dirrection="left" />

            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontSize: { xs: '1.6rem', md: '2.125rem' } }}
                >
                    {textos.titulo}
                </Typography>

                <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
                    {textos.subtitulo}
                </Typography>

                <BuscadorRut cargando={estado === 'cargando'} onBuscar={buscar} onLimpiar={limpiar} />

                <Box sx={{ mt: 4 }}>
                    {estado !== 'inicial' && estado !== 'cargando' && (
                        <Typography
                            ref={tituloResultados}
                            tabIndex={-1}
                            variant="h5"
                            component="h2"
                            sx={{ fontWeight: 600, mb: 1, outline: 'none' }}
                        >
                            {textos.resultados.titulo}
                        </Typography>
                    )}

                    {/* Solo el resumen se anuncia; las tarjetas no van dentro de la región viva. */}
                    <Typography
                        role="status"
                        aria-live="polite"
                        variant="body2"
                        color="text.secondary"
                        sx={estado === 'cargando' ? sxSoloLectores : { mb: resumen ? 2 : 0 }}
                    >
                        {resumen}
                    </Typography>

                    {/* El banner entra con un fundido y sale sin animación: si saliera con fundido,
                        convivirían banner y resultados un instante y luego todo saltaría (Q3). */}
                    {estado === 'cargando' ? (
                        banner ? (
                            <Fade in appear timeout={reducirMovimiento ? 0 : 300}>
                                <Box>
                                    <BannerOfertas ofertas={banner.ofertas} indiceInicial={banner.indiceInicial} />
                                </Box>
                            </Fade>
                        ) : (
                            <EstadoResultado estado="cargando" />
                        )
                    ) : null}

                    {/* Resultados, vacío o error entran con un fundido de 250 ms (Q3). */}
                    {estado === 'ok' || estado === 'vacio' || estado === 'error' ? (
                        <Fade in appear timeout={reducirMovimiento ? 0 : 250}>
                            <Box>
                                {estado === 'vacio' && <EstadoResultado estado="vacio" />}

                                {estado === 'error' && (
                                    <EstadoResultado
                                        estado="error"
                                        mensaje={mensajeError}
                                        onReintentar={() => buscar(rutBuscado.current)}
                                    />
                                )}

                                {estado === 'ok' && resultado && (
                                    <Grid container spacing={3}>
                                        {botonesChequeo.length > 0 && (
                                            <Grid item xs={12} md={botonesBio.length > 0 ? 6 : 12}>
                                                <TarjetaDocumentos
                                                    titulo={textos.tarjetas.chequeo.titulo}
                                                    icono={<FavoriteBorderOutlinedIcon />}
                                                    nombre={resultado.nombre}
                                                    botones={botonesChequeo}
                                                    onDescargar={descargar}
                                                    onRenovarUrl={renovarUrl}
                                                />
                                            </Grid>
                                        )}

                                        {botonesBio.length > 0 && (
                                            <Grid item xs={12} md={botonesChequeo.length > 0 ? 6 : 12}>
                                                <TarjetaDocumentos
                                                    titulo={textos.tarjetas.bioimpedancia.titulo}
                                                    icono={<AccessibilityNewOutlinedIcon />}
                                                    nombre={resultado.nombre}
                                                    botones={botonesBio}
                                                    ayuda={textos.resultados.ayudaBio}
                                                    onDescargar={descargar}
                                                    onRenovarUrl={renovarUrl}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                )}
                            </Box>
                        </Fade>
                    ) : null}
                </Box>
            </Container>
        </>
    );
};


export default CertificadoPage;
