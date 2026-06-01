import {
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography
} from "@mui/material";

import { useState } from "react";

import { useSpeechRecognition } from "../hooks/use-speech-recognitionGPT";
import { AsistenteVozService } from "../service/asistente-voz.service";
import Swal from "sweetalert2";



export const WebSpeechApiGPT = () => {

    const {textoFinal,textoTemporal,escuchando,iniciar,detener,limpiar} = useSpeechRecognition();

    const [loading, setLoading] = useState(false);

    const textoCompleto = `${textoFinal} ${textoTemporal}`.trim();

    const limpiarTodo = () => {

        limpiar();
        console.clear();
        console.log("Ficha limpiada");
    }

    
    const grabarFicha = async () => {

        if (!textoCompleto.trim()) {

            await Swal.fire({
                icon: "warning",
                title: "Sin información",
                text: "No hay texto para enviar."
            });
            return;
        }

        try {
            setLoading(true);

            const {postAsistenteVoz} = await AsistenteVozService();

            const response = await postAsistenteVoz({prompt: textoCompleto});

            console.log("Respuesta API:",response);

            const chequeo = response?.data?.data ?? response?.data ?? response;

            const labels: Record<string,string> = {

                nombre: "Nombre",
                rut: "RUT",
                fechaNacimiento: "Fecha Nacimiento",
                edad: "Edad",
                estatura: "Estatura",
                peso: "Peso",
                hemoglucotest: "Hemoglucotest",
                pulso: "Pulso",
                presionArterial: "Presión Arterial",
                presion_sistolica: "Presión Sistólica",
                saturacionOxigeno: "Saturación O₂",
                temperatura: "Temperatura",
                enfermedadesCronicas: "Enfermedades Crónicas",
                medicamentosDiarios: "Medicamentos",
                sistemaOsteoarticular: "Sistema Osteoarticular",
                sistemaCardiovascular: "Sistema Cardiovascular",
                enfermedadesAnteriores: "Enfermedades Anteriores",
                Recuperacion: "Recuperación",
                gradoIncidenciaPosterio: "Grado Incidencia",
                sexo_paciente: "Sexo",
                imc_paciente: "IMC",
                division_paciente: "División",
                frecuencia_cardiaca_paciente:"Frecuencia Cardíaca",
                derivacion_paciente: "Derivación",
                observacion_paciente: "Observación",
                email_paciente: "Correo"
            };

            const html = Object
                .entries(chequeo)
                .filter(([_, value]) =>
                    value !== null &&
                    value !== "" &&
                    value !== undefined
                )
                .map(([key, value]) => `
                    <tr>
                        <td style="
                            padding:8px;
                            font-weight:600;
                            text-align:left;
                            border-bottom:1px solid #eee;
                        ">
                            ${labels[key] ?? key}
                        </td>
                        <td style="
                            padding:8px;
                            text-align:left;
                            border-bottom:1px solid #eee;
                        ">
                            ${value}
                        </td>
                    </tr>
                `)
                .join("");

            const result =
                await Swal.fire({

                    icon: "success",

                    title:
                        "🩺 Datos Detectados",

                    html: `
                        <div
                            style="
                                max-height:500px;
                                overflow:auto;
                            "
                        >
                            <table
                                style="
                                    width:100%;
                                    border-collapse:
                                    collapse;
                                "
                            >
                                ${html}
                            </table>
                        </div>
                    `,

                    width: 900,
                    showCancelButton: true,
                    confirmButtonText:"Guardar",
                    cancelButtonText:"Cancelar"
                });
            if (result.isConfirmed) {
                console.log("Guardar ficha:",chequeo);
            }

        }
        catch (error: any) {

            console.error(error);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ??
                    error?.message ??
                    "Ocurrió un error inesperado"
            });
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Paper
            elevation={4}
            sx={{
                maxWidth: 1400,
                mx: "auto",
                p: 4,
                borderRadius: 3
            }}
        >
            <Stack spacing={3}>
                {/* HEADER */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                        bgcolor: "background.paper"
                    }}
                >
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row"
                        }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            🎙️ Asistente de Voz
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                        >
                            <Chip
                                color={
                                    escuchando
                                        ? "success"
                                        : "default"
                                }
                                label={
                                    escuchando
                                        ? "🎤 Escuchando"
                                        : "⏹️ Detenido"
                                }
                            />
                            <Button
                                variant="contained"
                                color="success"
                                onClick={iniciar}
                                disabled={
                                    escuchando
                                }
                            >
                                🎤 Iniciar
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={detener}
                                disabled={
                                    !escuchando
                                }
                            >
                                ⏹️ Detener
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={
                                    limpiarTodo
                                }
                            >
                                🧹 Limpiar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={
                                    grabarFicha
                                }
                                disabled={
                                    loading
                                }
                            >
                                {
                                    loading? (
                                        <>
                                            <CircularProgress
                                                size={
                                                    18
                                                }
                                            />
                                            &nbsp;Guardando...
                                        </>
                                    )
                                    : "💾 Grabar"
                                }
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
                {/* ESTADO EN VIVO */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        borderLeft: 5,
                        borderColor:
                            "success.main"
                    }}
                >
                    <Typography
                        fontWeight="bold"
                        gutterBottom
                    >
                        🎤 Dictado en Tiempo Real
                    </Typography>
                    <Typography>
                        {
                            textoTemporal ||
                            "Esperando voz..."
                        }
                    </Typography>
                </Paper>
                {/* TEXTO ACUMULADO */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        minHeight: 250,
                        bgcolor:
                            "background.default"
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                    >
                        📄 Texto Completo
                    </Typography>
                    <Typography
                        sx={{
                            whiteSpace:
                                "pre-wrap",
                            lineHeight: 1.8
                        }}
                    >
                        {
                            textoCompleto ||
                            "Comience a hablar para generar contenido..."
                        }
                    </Typography>
                </Paper>
                {/* DEBUG */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        bgcolor:
                            "#fafafa"
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Debug
                    </Typography>
                    <Typography
                        variant="body2"
                    >
                        Caracteres:
                        {" "}
                        {
                            textoCompleto.length
                        }
                    </Typography>
                    <Typography
                        variant="body2"
                    >
                        Estado:
                        {" "}
                        {
                            escuchando
                                ? "Escuchando"
                                : "Detenido"
                        }
                    </Typography>
                </Paper>
            </Stack>
        </Paper>
    );
}