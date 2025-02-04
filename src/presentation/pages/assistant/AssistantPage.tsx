import { useEffect, useRef, useState } from "react";

import { createThreadUseCase } from '../../core';

import {
    GptMessage,
    MyMessage,
    TypingLoaderTer,
    TextMessageBox
} from '../../components';
import { Box, Grid } from "@mui/material";


interface Message {
    text: string;
    isGpt: boolean;
}


export const AssistantPage = () => {

 const messagesEndRef =  useRef<null | HTMLDivElement>(null); 
     
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

 
  const handlePost = async (message : string) => {

    setIsLoading(true);
    //Toma los mensaje previos y agrega el nuevo mensaje 
    setMessages( (prev) => [...prev, { text: message, isGpt: false }] );
       
    //TODO UseCase
    
    const { AsQuestionUseCase } = await createThreadUseCase();

    const replies = await AsQuestionUseCase(message);
    setIsLoading(false);

    setMessages( (prev) => [
        ...prev, { 
            text: replies.response, 
            isGpt: true,
            
          }
      ]);
    
  }


    // Efecto para desplazarse hacia abajo cuando los mensajes cambian
    useEffect(() => {

        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if(isLoading == false) {
            messagesEndRef.current!.scrollIntoView({ behavior: 'smooth' });
        }

    
    }, [messages,isLoading]);

  return (
    <Box
            sx={{
                padding: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                boxShadow: 3, // Mejora la profundidad
            }}
        >
            <Box
                sx={{
                    height: '400px',
                    overflowY: 'auto',
                    borderRadius: 2,
                    padding: 2,
                    backgroundColor: '#fff',
                    boxShadow: 3, // Mejora la profundidad
                    border: '1px solid #e0e0e0', // Color de borde más suave
                }}
            >
                <Grid container spacing={2}>
                    {/* Mensaje de bienvenida */}
                    <Grid item xs={12}>
                        <GptMessage
                            text="Bienvenido a Ergosanita Virtual, ¿En qué puedo ayudarte?"
                        />
                    </Grid>

                    {messages.map((message, index) => (
                        <Grid item xs={12} key={index}>
                            {message.isGpt ? (
                                <GptMessage text={message.text} />
                            ) : (
                                <MyMessage text={message.text} />
                            )}
                        </Grid>
                    ))}

                    {isLoading && (
                        <Grid item xs={12} className="fade-in">
                            <TypingLoaderTer />
                        </Grid>
                    )}
                    {/* Este div es donde haremos scroll hacia abajo */}
                    <Box
                        ref={messagesEndRef}
                        sx={{
                            float: 'left',
                            clear: 'both',
                            display: 'block', // Asegúrate de que se comporte como un bloque
                        }}
                    />
                </Grid>
            </Box>
            <Box 
                sx={{ 
                    padding: 2, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    marginTop: 2 // Espaciado entre el área de mensajes y el cuadro de entrada
                }}
            >            
                <TextMessageBox
                    onSendMessage={handlePost}
                    placeholder="Escribe aquí lo que deseas"
                    disableCorrections
                />
            </Box>
        </Box>
  );

}