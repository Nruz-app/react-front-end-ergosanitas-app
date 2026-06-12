import { useEffect, useRef, useState } from "react";

import { createThreadUseCase } from '../../core';

import {
    GptMessage,
    MyMessage,
    TypingLoaderTer,
    TextMessageBox
} from '../../components';

import { Box, Grid, IconButton } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

import { useSpeechRecognition } from "../../hooks/use-speech-recognitionGPT";

interface Message {
    text: string;
    isGpt: boolean;
}

export const AssistantPage = () => {

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const [input, setInput] = useState("");

    // HOOK DE VOZ 
    const {textoFinal,textoTemporal,escuchando,iniciar,detener,limpiar} = useSpeechRecognition();

    // Sincroniza voz con input
    useEffect(() => {
        setInput(textoFinal + textoTemporal);
    }, [textoFinal, textoTemporal]);

    /************* Envio Automativo Al Termina de Hablar *********** 
     useEffect(() => {
         if (textoFinal.trim()) {
             handlePost(textoFinal.trim());
             limpiar();
         }
     }, [textoFinal]);
    **********************************************************************/

    const handlePost = async (message: string) => {

        detener();
        limpiar();

        if (!message.trim()) return;

        setIsLoading(true);

        setMessages((prev) => [
            ...prev,
            { text: message, isGpt: false }
        ]);
        setInput("");
        const { AsQuestionUseCase } = await createThreadUseCase();
        const replies = await AsQuestionUseCase(message);
        setMessages((prev) => [
            ...prev,
            {
                text: replies.response,
                isGpt: true,
            }
        ]);
        setIsLoading(false);
    }

    const handleResetPatient = async () => {
        try {
            setIsLoading(true);

            const { handleResetPatient } = await createThreadUseCase();

            const sessionId = localStorage.getItem("chat_session_id");

            if (!sessionId) return;

            await handleResetPatient();

            setInput("");

            setMessages([
                {
                    text: "Indica el RUT o Nombre del Nuevo Paciente.",
                    isGpt: true,
                }
            ]);

        } 
        catch (error) {
            console.error(error);

            setMessages([
                {
                    text: "Error al cambiar paciente.",
                    isGpt: true,
                }
            ]);
        } 
        finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 3 }}>

            {/* CHAT */}
            <Box
                sx={{
                    height: '400px',
                    overflowY: 'auto',
                    borderRadius: 2,
                    padding: 2,
                    backgroundColor: '#fff',
                    boxShadow: 3,
                    border: '1px solid #e0e0e0',
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <GptMessage text="Bienvenido a Ergosanitas Virtual. Indica el RUT o nombre del paciente." />
                    </Grid>
                    {messages.map((message, index) => (
                        <Grid item xs={12} key={index}>
                            {message.isGpt
                                ? <GptMessage text={message.text} />
                                : <MyMessage text={message.text} />
                            }
                        </Grid>
                    ))}
                    {isLoading && (
                        <Grid item xs={12}>
                            <TypingLoaderTer />
                        </Grid>
                    )}
                    <Box ref={messagesEndRef} />
                </Grid>
            </Box>
            {/* INPUT + MIC */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
                {/* MIC BUTTON */}
                <IconButton
                    color={escuchando ? "error" : "primary"}
                    onClick={() => escuchando ? detener() : iniciar()}
                >
                    {escuchando ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
                {/* INPUT */}
                <Box sx={{ flex: 1 }}>
                    <TextMessageBox
                        value={input}
                        onChange={setInput}
                        onSendMessage={handlePost}
                        placeholder="Escribe o habla aquí..."
                        onResetPatient={handleResetPatient}
                    />
                </Box>
            </Box>
        </Box>
    );
}