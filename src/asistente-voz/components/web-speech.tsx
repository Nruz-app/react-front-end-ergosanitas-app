import {
    Button,
    Chip,
    Grid,
    Paper,
    Stack,
    Typography
} from "@mui/material";

import { useMemo } from "react";

import { useSpeechRecognition }
from "../hooks/use-speech-recognition";

import { extraerChequeo } from "../helpers/extraer-chequeo";

import { CampoChequeo } from "./campo-chequeo";

import {
    datosPersonales,
    antropometria,
    signosVitales,
    antecedentes
} from "../helpers/configuracion-campos";

export const WebSpeechApi = () => {

    const {textoFinal,textoTemporal,escuchando,iniciar,detener} = useSpeechRecognition();

    const paciente = useMemo(
            () =>
                extraerChequeo(
                    textoFinal
                ),
            [textoFinal]
    );

    const limpiarCampo = (campo: string) => {

        console.log(
            "Limpiar campo:",
            campo
        );

    }

    const limpiarTodo = () => {

        console.clear();

        console.log(
            "Limpiar ficha"
        );

    }

    const grabarFicha = () => {

        console.log(
            "Paciente:",
            paciente
        );

        // TODO:
        // consumir API
    }

    const renderGrupoCampos = (titulo: string,campos: any[],md: number = 6) => (
        <>
            <Typography
                variant="h6"
                fontWeight="bold"
            >
                {titulo}
            </Typography>

            <Grid
                container
                spacing={2}
            >

                {campos.map(
                    campo => (

                        <Grid
                            item
                            xs={12}
                            md={md}
                            key={campo.key}
                        >

                            <CampoChequeo
                                label={
                                    campo.label
                                }
                                value={
                                    (paciente as any)[campo.key] ?? ""
                                }
                                onClear={() =>
                                    limpiarCampo(
                                        campo.key
                                    )
                                }
                            />

                        </Grid>

                    )
                )}

            </Grid>
        </>

    );
    
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
                            Asistente de Voz
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
                                disabled={escuchando}
                            >
                                🎤 Iniciar
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={detener}
                                disabled={!escuchando}
                            >
                                ⏹️ Detener
                            </Button>

                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={limpiarTodo}
                            >
                                🧹 Limpiar Todo
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={grabarFicha}
                            >
                                💾 Grabar
                            </Button>

                        </Stack>

                    </Stack>

                </Paper>
                {/* TEXTO ESCUCHADO */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        borderLeft: 5,
                        borderColor: "success.main"
                    }}
                >
                    <Typography
                        fontWeight="bold"
                        gutterBottom
                    >
                        🎤 Escuchando
                    </Typography>
                    <Typography>
                        {
                            textoTemporal ||
                            "Esperando voz..."
                        }
                    </Typography>
                </Paper>
                {/* DEBUG */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        bgcolor: "#fafafa"
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                    >
                        Texto Reconocido
                    </Typography>

                    <Typography
                        variant="body2"
                    >
                        {textoFinal}
                    </Typography>
                </Paper>
                {/* DATOS PERSONALES */}
                {renderGrupoCampos(
                    "Datos Personales",
                    datosPersonales,
                    6
                )}
                {/* ANTROPOMETRIA */}
                {renderGrupoCampos(
                    "Antropometría",
                    antropometria,
                    4
                )}
                {/* SIGNOS VITALES */}
                {renderGrupoCampos(
                    "Signos Vitales",
                    signosVitales,
                    4
                )}
                {/* ANTECEDENTES */}
                {renderGrupoCampos(
                    "Antecedentes",
                    antecedentes,
                    6
                )}
            </Stack>
        </Paper>
    );
}