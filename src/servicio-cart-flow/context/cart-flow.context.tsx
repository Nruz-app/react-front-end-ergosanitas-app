import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { CLAVE_STORAGE_CARRITO, PASO } from '../config/textos';
import type { ICarrito, ICatalogo, ICheckoutForm, IComuna, IPacienteForm, IPedido, PlanCarro } from '../interface';
import { CartFlowError, UseCartFlowService } from '../services';
import { mostrarError } from '../utilities';

/**
 * Estado del flujo `servicio-cart-flow`. El back es la única fuente de precios (D2 de la spec):
 * cada acción reemplaza el carro con la respuesta del servidor, sin cálculos locales.
 *
 * Solo el `uuid` del carro vive en localStorage (D3): un F5 retoma el carro abierto, y ningún
 * dato del paciente queda en el navegador.
 */
interface CartFlowContextProps {
    comunas      : IComuna[];
    catalogo     : ICatalogo | null;
    carrito      : ICarrito | null;
    pedido       : IPedido | null;
    paso         : number;
    cargando     : boolean;
    iniciado     : boolean;
    irA          : (paso: number) => void;
    elegirComuna : (comuna: IComuna) => Promise<boolean>;
    cambiarPlan  : (plan: PlanCarro) => Promise<void>;
    agregar      : (pacienteId: number, sku: string) => Promise<boolean>;
    cambiarCantidad : (lineaId: number, cantidad: number) => Promise<void>;
    quitarLinea  : (lineaId: number) => Promise<void>;
    agregarPaciente : () => Promise<void>;
    quitarPaciente  : (pacienteId: number) => Promise<void>;
    guardarPacientes : (datos: Record<number, IPacienteForm>, direccion: string, referencia: string) => Promise<boolean>;
    confirmar    : (form: ICheckoutForm) => Promise<IPedido | null>;
    pagarWebPay  : (pedido: IPedido) => Promise<void>;
    reiniciar    : () => void;
}

const CartFlowContext = createContext<CartFlowContextProps | null>(null);

const leerUuid = (): string | null => {
    try { return window.localStorage.getItem(CLAVE_STORAGE_CARRITO); }
    catch { return null; }
};

const guardarUuid = (uuid: string | null) => {
    try {
        if (uuid) window.localStorage.setItem(CLAVE_STORAGE_CARRITO, uuid);
        else window.localStorage.removeItem(CLAVE_STORAGE_CARRITO);
    }
    catch { /* almacenamiento bloqueado: el carro dura lo que dure la pestaña */ }
};

/** El formulario de Webpay es un POST con token_ws; no es navegable con un enlace. */
const enviarAWebPay = (url: string, token: string) => {

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
};

interface Props {
    children: ReactNode;
}

export const CartFlowProvider = ({ children }: Props) => {

    const [comunas, setComunas] = useState<IComuna[]>([]);
    const [catalogo, setCatalogo] = useState<ICatalogo | null>(null);
    const [carrito, setCarrito] = useState<ICarrito | null>(null);
    const [pedido, setPedido] = useState<IPedido | null>(null);
    const [paso, setPaso] = useState<number>(PASO.comuna);
    const [cargando, setCargando] = useState<boolean>(false);
    const [iniciado, setIniciado] = useState<boolean>(false);

    const reiniciar = useCallback(() => {
        guardarUuid(null);
        setCarrito(null);
        setPedido(null);
        setPaso(PASO.comuna);
    }, []);

    /**
     * Corre una acción con indicador de carga. Un 409 por carro convertido o expirado empieza
     * de nuevo; cualquier otro error se muestra y la acción devuelve null.
     */
    const ejecutar = useCallback(async <T,>(accion: () => Promise<T>): Promise<T | null> => {

        setCargando(true);

        try {
            return await accion();
        }
        catch (problema) {
            if (problema instanceof CartFlowError && problema.status === 409
                && typeof problema.detalle === 'string' && problema.detalle.startsWith('carrito_')) {
                reiniciar();
            }

            mostrarError(problema);
            return null;
        }
        finally {
            setCargando(false);
        }
    }, [reiniciar]);

    useEffect(() => {

        const iniciar = async () => {

            const servicio = await UseCartFlowService();

            try {
                const [listaComunas, listaCatalogo] = await Promise.all([servicio.getComunas(), servicio.getCatalogo()]);
                setComunas(listaComunas);
                setCatalogo(listaCatalogo);
            }
            catch (problema) {
                mostrarError(problema);
            }

            const uuid = leerUuid();

            if (uuid) {
                try {
                    const guardado = await servicio.getCarrito(uuid);

                    if (guardado.estado === 'abierto') {
                        setCarrito(guardado);
                        setPaso(guardado.comuna && !guardado.a_cotizar ? PASO.catalogo : PASO.comuna);
                    }
                    else {
                        guardarUuid(null);
                    }
                }
                catch {
                    guardarUuid(null);
                }
            }

            setIniciado(true);
        };

        iniciar();
    }, []);

    const elegirComuna = useCallback(async (comuna: IComuna) => {

        const nuevo = await ejecutar(async () => {
            const servicio = await UseCartFlowService();

            return carrito
                ? servicio.actualizarCarrito(carrito.uuid, { comuna_id: comuna.id })
                : servicio.crearCarrito(comuna.id);
        });

        if (!nuevo) return false;

        guardarUuid(nuevo.uuid);
        setCarrito(nuevo);

        return true;
    }, [carrito, ejecutar]);

    /** Acciones sobre un carro existente: todas reemplazan el carro con la respuesta. */
    const sobreCarrito = useCallback(async (accion: (uuid: string, servicio: Awaited<ReturnType<typeof UseCartFlowService>>) => Promise<ICarrito>) => {

        if (!carrito) return false;

        const nuevo = await ejecutar(async () => accion(carrito.uuid, await UseCartFlowService()));

        if (nuevo) setCarrito(nuevo);

        return nuevo !== null;
    }, [carrito, ejecutar]);

    const cambiarPlan = useCallback(async (plan: PlanCarro) => {
        await sobreCarrito((uuid, s) => s.actualizarCarrito(uuid, { plan }));
    }, [sobreCarrito]);

    const agregar = useCallback((pacienteId: number, sku: string) =>
        sobreCarrito((uuid, s) => s.agregarLinea(uuid, pacienteId, sku)), [sobreCarrito]);

    const cambiarCantidad = useCallback(async (lineaId: number, cantidad: number) => {
        await sobreCarrito((uuid, s) => s.actualizarLinea(uuid, lineaId, cantidad));
    }, [sobreCarrito]);

    const quitarLinea = useCallback(async (lineaId: number) => {
        await sobreCarrito((uuid, s) => s.quitarLinea(uuid, lineaId));
    }, [sobreCarrito]);

    const agregarPaciente = useCallback(async () => {
        await sobreCarrito((uuid, s) => s.agregarPaciente(uuid));
    }, [sobreCarrito]);

    const quitarPaciente = useCallback(async (pacienteId: number) => {
        await sobreCarrito((uuid, s) => s.quitarPaciente(uuid, pacienteId));
    }, [sobreCarrito]);

    /** D5: los datos se guardan en el back para que edad y sexo validen las líneas antes de pagar. */
    const guardarPacientes = useCallback((datos: Record<number, IPacienteForm>, direccion: string, referencia: string) =>
        sobreCarrito(async (uuid, s) => {
            let ultimo = await s.actualizarCarrito(uuid, { direccion, referencia });

            for (const [id, form] of Object.entries(datos)) {
                ultimo = await s.actualizarPaciente(uuid, Number(id), form);
            }

            return ultimo;
        }), [sobreCarrito]);

    const pagarWebPay = useCallback(async (actual: IPedido) => {

        if (!actual.token_consulta) return;

        const transaccion = await ejecutar(async () => (await UseCartFlowService()).iniciarWebPay(actual.numero, actual.token_consulta!));

        if (transaccion) enviarAWebPay(transaccion.url, transaccion.token);
    }, [ejecutar]);

    const confirmar = useCallback(async (form: ICheckoutForm) => {

        if (!carrito) return null;

        const creado = await ejecutar(async () => (await UseCartFlowService()).checkout(carrito.uuid, form));

        if (!creado) return null;

        // El carro ya es pedido: el próximo ingreso empieza uno nuevo.
        guardarUuid(null);
        setPedido(creado);
        setPaso(PASO.confirmacion);

        if (creado.medio_pago === 'webpay') await pagarWebPay(creado);

        return creado;
    }, [carrito, ejecutar, pagarWebPay]);

    const valor = useMemo<CartFlowContextProps>(() => ({
        comunas, catalogo, carrito, pedido, paso, cargando, iniciado,
        irA: setPaso,
        elegirComuna, cambiarPlan, agregar, cambiarCantidad, quitarLinea,
        agregarPaciente, quitarPaciente, guardarPacientes, confirmar, pagarWebPay, reiniciar,
    }), [comunas, catalogo, carrito, pedido, paso, cargando, iniciado, elegirComuna, cambiarPlan, agregar,
        cambiarCantidad, quitarLinea, agregarPaciente, quitarPaciente, guardarPacientes, confirmar, pagarWebPay, reiniciar]);

    return <CartFlowContext.Provider value={valor}>{children}</CartFlowContext.Provider>;
};

export const useCartFlow = (): CartFlowContextProps => {

    const contexto = useContext(CartFlowContext);

    if (!contexto) throw new Error('useCartFlow debe usarse dentro de CartFlowProvider');

    return contexto;
};
