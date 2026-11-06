import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material';

import {
    AgendaBloques, BotonCarroFlotante, CarroResumen, CatalogoProductos, ConfirmacionPedido, PasoPacientes, PasoPago,
    SelectorComuna, StepperCartFlow,
} from '../components';
import type { SeleccionAgenda } from '../components';
import { PASO, PASOS } from '../config/textos';
import { COLORES, FONDO_PAGINA } from '../config/tema';
import { useCartFlow } from '../context';
import type { ICarrito, IComuna } from '../interface';

/** Paso más alto al que se puede saltar desde el stepper, según lo que ya tiene el carro. */
const pasoMaximo = (carrito: ICarrito | null, agenda: SeleccionAgenda | null): number => {

    if (!carrito?.comuna || carrito.a_cotizar) return PASO.comuna;

    const conLineas = carrito.pacientes.filter((p) => p.lineas.length > 0);

    if (conLineas.length === 0) return PASO.catalogo;

    const bloqueado = carrito.bloqueos.some((b) => b.codigo !== 'carro_vacio');

    if (bloqueado) return PASO.carro;

    const datosCompletos = !!carrito.direccion
        && conLineas.every((p) => p.nombre && p.rut && p.fecha_nac && p.consentimiento);

    if (!datosCompletos) return PASO.pacientes;

    return agenda ? PASO.pago : PASO.agenda;
};

const cantidadLineas = (carrito: ICarrito | null) =>
    carrito?.pacientes.reduce((n, p) => n + p.lineas.filter((l) => !l.automatica).length, 0) ?? 0;

/**
 * Página del flujo: la única que orquesta. Los componentes son presentacionales y reciben todo
 * por props; el estado y las llamadas viven en `CartFlowProvider`.
 */
export const ServicioCartFlowPage = () => {

    const navigate = useNavigate();
    const flujo = useCartFlow();
    const { carrito, catalogo, comunas, pedido, paso, cargando, iniciado, irA } = flujo;

    const [agenda, setAgenda] = useState<SeleccionAgenda | null>(null);

    const maximo = pasoMaximo(carrito, agenda);
    const lineas = cantidadLineas(carrito);

    const cotizar = (datos: { comuna?: string; sku?: string; servicio?: string }) => {
        const query = new URLSearchParams(Object.entries(datos).filter(([, v]) => !!v) as [string, string][]);
        navigate(`/servicios/cotizar?${query.toString()}`);
    };

    const elegirComuna = async (comuna: IComuna) => {
        if (await flujo.elegirComuna(comuna)) irA(PASO.catalogo);
    };

    const nuevo = () => {
        setAgenda(null);
        flujo.reiniciar();
    };

    const renderPaso = () => {

        if (!iniciado) return <Box textAlign="center" sx={{ py: 8 }}><CircularProgress /></Box>;

        if (paso === PASO.confirmacion && pedido) {
            return (
                <ConfirmacionPedido
                    pedido={pedido}
                    cargando={cargando}
                    onPagar={() => flujo.pagarWebPay(pedido)}
                    onNuevo={nuevo}
                />
            );
        }

        if (paso === PASO.comuna || !carrito) {
            return (
                <SelectorComuna
                    comunas={comunas}
                    seleccionada={carrito?.comuna ?? null}
                    cargando={cargando}
                    errorServidor={flujo.errorComunas}
                    onElegir={elegirComuna}
                    onCotizar={(nombre) => cotizar({ comuna: nombre })}
                />
            );
        }

        switch (paso) {

            case PASO.catalogo:
                return catalogo ? (
                    <CatalogoProductos
                        catalogo={catalogo}
                        carrito={carrito}
                        cargando={cargando}
                        onAgregar={flujo.agregar}
                        onCotizar={(sku, servicio) => cotizar({ sku, servicio, comuna: carrito.comuna?.comuna })}
                    />
                ) : <Box textAlign="center" sx={{ py: 8 }}><CircularProgress /></Box>;

            case PASO.carro:
                return (
                    <CarroResumen
                        carrito={carrito}
                        cargando={cargando}
                        onCantidad={flujo.cambiarCantidad}
                        onQuitarLinea={flujo.quitarLinea}
                        onAgregarPaciente={flujo.agregarPaciente}
                        onQuitarPaciente={flujo.quitarPaciente}
                        onPlan={flujo.cambiarPlan}
                        onSeguirComprando={() => irA(PASO.catalogo)}
                    />
                );

            case PASO.pacientes:
                return (
                    <PasoPacientes
                        carrito={carrito}
                        cargando={cargando}
                        onGuardar={async (datos, direccion, referencia) => {
                            if (await flujo.guardarPacientes(datos, direccion, referencia)) irA(PASO.agenda);
                        }}
                    />
                );

            case PASO.agenda:
                return (
                    <AgendaBloques
                        uuid={carrito.uuid}
                        seleccion={agenda}
                        onElegir={setAgenda}
                        onContinuar={() => irA(PASO.pago)}
                    />
                );

            case PASO.pago:
                return agenda ? (
                    <PasoPago carrito={carrito} agenda={agenda} cargando={cargando} onConfirmar={flujo.confirmar} />
                ) : null;

            default:
                return null;
        }
    };

    /** En Catálogo el avance es el botón flotante; en Carro, el botón de la barra inferior. */
    const enCatalogo = !!carrito && paso === PASO.catalogo;
    const siguiente = paso === PASO.carro;

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', minHeight: '100vh', p: { xs: 2, md: 4 }, background: FONDO_PAGINA }}>
            <Paper elevation={0} sx={{
                p: { xs: 2, md: 5 }, borderRadius: 6, background: COLORES.fondoPanel,
                backdropFilter: 'blur(12px)', border: `1px solid ${COLORES.bordePanel}`,
            }}>
                <StepperCartFlow paso={paso} maximo={maximo} onIr={irA} />

                <Box sx={{ height: 4, mt: 2 }}>{cargando && <LinearProgress />}</Box>

                <Typography variant="h5" fontWeight="bold" textAlign="center" color={COLORES.primarioOsc} sx={{ my: 3 }}>
                    {PASOS[paso]}
                </Typography>

                {renderPaso()}

                {enCatalogo && carrito && (
                    <BotonCarroFlotante
                        cantidad={lineas}
                        total={carrito.desglose.total}
                        deshabilitado={PASO.carro > maximo || cargando}
                        onClick={() => irA(PASO.carro)}
                    />
                )}

                {carrito && paso > PASO.comuna && paso < PASO.confirmacion && (
                    // En Catálogo deja espacio para que el botón flotante no tape las últimas tarjetas.
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 5, pb: enCatalogo ? 10 : 0 }} spacing={2}>
                        <Button onClick={() => irA(paso - 1)} sx={{ color: COLORES.primarioOsc, fontWeight: 'bold' }}>
                            ← Volver
                        </Button>

                        {siguiente && (
                            <Button
                                variant="contained"
                                disabled={paso + 1 > maximo || cargando}
                                onClick={() => irA(paso + 1)}
                                sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, '&:hover': { background: COLORES.navyHover } }}
                            >
                                Datos de los pacientes
                            </Button>
                        )}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
};

export default ServicioCartFlowPage;
