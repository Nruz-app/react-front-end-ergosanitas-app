import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export const useSpeechRecognition = () => {

    const [textoFinal, setTextoFinal] = useState("");
    const [textoTemporal, setTextoTemporal] = useState("");
    const [escuchando, setEscuchando] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "es-CL";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {

            let finalText = "";
            let tempText = "";

            for (let i = event.resultIndex; i < event.results.length;i++) {

                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) 
                    finalText += transcript + " ";
                else 
                    tempText += transcript;
            }
            if (finalText) {
                setTextoFinal(prev => prev + finalText);
            }
            setTextoTemporal(tempText);
        }

        recognition.onstart = () => { setEscuchando(true); };
        recognition.onend = () => { setEscuchando(false); };
        recognitionRef.current = recognition;

    }, []);

    const iniciar = () => {

        if (escuchando) return;

        recognitionRef.current?.start();
    }

    const detener = () => {
        recognitionRef.current?.stop();
    }

    const limpiar = () => {
        setTextoFinal("");
        setTextoTemporal("");
    }

    return {
        textoFinal,
        textoTemporal,
        escuchando,
        iniciar,
        detener,
        limpiar
    }
}