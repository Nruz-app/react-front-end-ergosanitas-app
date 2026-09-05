import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reconocimiento de voz para el chat del Home del colegio (Spec 03).
 *
 * Clon de `src/ficha-clinica/hooks/useReconocimientoVoz.ts`. Se duplica por la misma razón que
 * el servicio: la regla dura del módulo prohíbe importar de otros módulos que no sean
 * `src/common/`.
 *
 * `SpeechRecognition` es una API de navegador sin tipos en `lib.dom.d.ts` estándar. El asistente
 * global la declara en `Window` con `any`; aquí se tipa localmente para no ampliar la interfaz
 * global desde este módulo — dos declaraciones del mismo `Window` en el mismo proyecto tienen
 * que ser compatibles, y esa es una dependencia invisible que se rompe sola.
 */

interface ResultadoReconocimiento {
    isFinal : boolean;
    0       : { transcript: string };
}

interface EventoReconocimiento {
    resultIndex : number;
    results     : ArrayLike<ResultadoReconocimiento>;
}

interface Reconocedor {
    lang           : string;
    continuous     : boolean;
    interimResults : boolean;
    onresult       : ((evento: EventoReconocimiento) => void) | null;
    onstart        : (() => void) | null;
    onend          : (() => void) | null;
    start          : () => void;
    stop           : () => void;
}

type ConstructorReconocedor = new () => Reconocedor;

export const useReconocimientoVoz = () => {

    const [textoFinal, setTextoFinal] = useState('');
    const [textoTemporal, setTextoTemporal] = useState('');
    const [escuchando, setEscuchando] = useState(false);

    const reconocedorRef = useRef<Reconocedor | null>(null);

    useEffect(() => {

        const ventana = window as unknown as {
            SpeechRecognition?       : ConstructorReconocedor;
            webkitSpeechRecognition? : ConstructorReconocedor;
        };

        const SpeechRecognition =
            ventana.SpeechRecognition || ventana.webkitSpeechRecognition;

        // Firefox y Safari antiguos no la exponen. El chat sigue funcionando por texto:
        // `reconocedorRef` queda en null e `iniciar` no hace nada.
        if (!SpeechRecognition) return;

        const reconocedor = new SpeechRecognition();

        reconocedor.lang = 'es-CL';
        reconocedor.continuous = true;
        reconocedor.interimResults = true;

        reconocedor.onresult = (evento) => {

            let definitivo = '';
            let temporal = '';

            // `resultIndex` marca desde dónde hay novedades: reprocesar desde 0 duplicaría todo
            // lo ya acumulado en cada evento.
            for (let i = evento.resultIndex; i < evento.results.length; i++) {

                const transcripcion = evento.results[i][0].transcript;

                if (evento.results[i].isFinal) definitivo += transcripcion + ' ';
                else temporal += transcripcion;
            }

            if (definitivo) setTextoFinal((previo) => previo + definitivo);

            setTextoTemporal(temporal);
        };

        reconocedor.onstart = () => setEscuchando(true);
        reconocedor.onend = () => setEscuchando(false);

        reconocedorRef.current = reconocedor;

        // Corte al desmontar, por si el Home deja de renderizarse.
        //
        // ⚠️ **No basta para el cambio de tab**: `TabPanel` oculta los paneles con
        // `display: none` en vez de desmontarlos —así la lista conserva sus filtros—, así que
        // este cleanup no se dispara al salir del Home. De eso se encarga la prop `activo` de
        // `AsistenteColegio`, que llama a `detener()`.
        return () => {
            reconocedor.onresult = null;
            reconocedor.onstart = null;
            reconocedor.onend = null;
            reconocedor.stop();
        };
    }, []);

    // Los tres van con `useCallback` para que el consumidor pueda ponerlos como dependencia de
    // un efecto sin que este se re-dispare en cada render.
    const iniciar = useCallback(() => {

        if (escuchando) return;

        reconocedorRef.current?.start();
    }, [escuchando]);

    const detener = useCallback(() => {
        reconocedorRef.current?.stop();
    }, []);

    const limpiar = useCallback(() => {
        setTextoFinal('');
        setTextoTemporal('');
    }, []);

    return {
        textoFinal,
        textoTemporal,
        escuchando,
        iniciar,
        detener,
        limpiar,
    };
};
