import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";

const AppElectrocardiogramaPage = () => {

  return (

    <>

      <Helmet>

        {/* SEO PRINCIPAL */}
        <title>
          Electrocardiograma en San Bernardo | ECG Profesional | Ergosanitas
        </title>

        <meta
          name="description"
          content="
          Realizamos electrocardiogramas en San Bernardo.
          Examen cardiovascular rápido, seguro y profesional.
          Detecta arritmias, alteraciones cardíacas y problemas cardiovasculares.
          Agenda tu atención en Ergosanitas.
          "
        />

        <meta
          name="keywords"
          content="
          electrocardiograma,
          ecg,
          examen cardiológico,
          examen corazón,
          chequeo cardiovascular,
          arritmia,
          examen cardiovascular,
          electrocardiograma en San Bernardo,
          electrocardiograma Santiago,
          ergosanitas
          "
        />

        <meta name="robots" content="index, follow" />

        {/* CANONICAL */}
        <link
          rel="canonical"
          href="https://ergosanitas.com/servicios/electrocardiograma"
        />

        {/* OPEN GRAPH */}
        <meta
          property="og:title"
          content="Electrocardiograma en San Bernardo | Ergosanitas"
        />

        <meta
          property="og:description"
          content="
          Examen cardiovascular rápido, seguro y profesional.
          Electrocardiogramas en San Bernardo.
          "
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content="https://ergosanitas.com/servicios/electrocardiograma"
        />

        <meta
          property="og:image"
          content="https://ergosanitas.com/images/electrocardiograma.webp"
        />

      </Helmet>

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom, #e0f2fe, #f8fafc)",
          py: 8,
        }}
      >

        <Container maxWidth="lg">

          {/* HERO */}

          <Card
            elevation={0}
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #0f172a, #1e3a8a)",
              color: "white",
              mb: 6,
              boxShadow:
                "0 15px 40px rgba(0,0,0,0.25)",
            }}
          >

            <CardContent
              sx={{
                p: { xs: 4, md: 7 },
              }}
            >

              <Stack spacing={4}>

                <Chip
                  icon={<FavoriteIcon />}
                  label="Chequeo Cardiovascular"
                  sx={{
                    width: "fit-content",
                    backgroundColor:
                      "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: {
                      xs: "2.4rem",
                      md: "4.2rem",
                    },
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  Electrocardiograma
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: "1rem",
                      md: "1.25rem",
                    },
                    opacity: 0.9,
                    maxWidth: "850px",
                    lineHeight: 1.9,
                  }}
                >
                  El electrocardiograma (ECG)
                  es un examen médico que permite
                  registrar la actividad eléctrica
                  del corazón y detectar alteraciones
                  cardíacas de manera rápida,
                  segura y no invasiva.
                </Typography>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >

                  <Button
                    component={RouterLink}
                    to="/servicios"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      borderColor: "white",
                      color: "white",
                      fontWeight: "bold",
                      "&:hover": {
                        borderColor: "#38bdf8",
                        backgroundColor:
                          "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    Ver Más Servicios
                  </Button>

                </Stack>

              </Stack>

            </CardContent>

          </Card>

          {/* IMAGEN SEO */}

          <Box
            component="img"
            src="/images/electrocardiograma.webp"
            alt="Electrocardiograma en San Bernardo"
            sx={{
              width: "100%",
              borderRadius: 5,
              mb: 6,
              objectFit: "cover",
              maxHeight: 450,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.12)",
            }}
          />

          {/* CONTENIDO */}

          <Grid
            container
            spacing={4}
          >

            {/* INFORMACIÓN PRINCIPAL */}

            <Grid item xs={12} md={8}>

              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  p: 2,
                  height: "100%",
                  background:
                    "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(10px)",
                }}
              >

                <CardContent>

                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      fontSize: {
                        xs: "2rem",
                        md: "2.5rem",
                      },
                    }}
                  >
                    ¿Qué es un Electrocardiograma?
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: 2,
                      color: "#334155",
                      mb: 4,
                    }}
                  >
                    El electrocardiograma (ECG)
                    es un examen diagnóstico que
                    registra la actividad eléctrica
                    del corazón mediante pequeños
                    electrodos colocados sobre la piel.
                    Este procedimiento permite detectar
                    arritmias, infartos, enfermedades
                    cardíacas y otras alteraciones
                    cardiovasculares.
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: 2,
                      color: "#334155",
                      mb: 4,
                    }}
                  >
                    El examen es rápido, seguro,
                    indoloro y no invasivo.
                    Es ampliamente utilizado en
                    chequeos preventivos,
                    evaluaciones ocupacionales
                    y controles médicos generales.
                  </Typography>

                  <Divider sx={{ my: 5 }} />

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      fontSize: {
                        xs: "1.6rem",
                        md: "2rem",
                      },
                    }}
                  >
                    Beneficios del examen
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 5 }}>

                    <Chip
                      icon={<MonitorHeartIcon />}
                      label="Evaluación cardíaca rápida"
                    />

                    <Chip
                      icon={<MedicalServicesIcon />}
                      label="Examen no invasivo"
                    />

                    <Chip
                      icon={<AccessTimeIcon />}
                      label="Procedimiento rápido y seguro"
                    />

                  </Stack>

                  <Divider sx={{ my: 5 }} />

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      fontSize: {
                        xs: "1.6rem",
                        md: "2rem",
                      },
                    }}
                  >
                    ¿Cuándo realizar un ECG?
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: 2,
                      color: "#334155",
                      mb: 4,
                    }}
                  >
                    El electrocardiograma puede
                    ser solicitado en presencia
                    de síntomas como dolor torácico,
                    palpitaciones, mareos,
                    dificultad respiratoria
                    o antecedentes cardíacos.
                    También se utiliza como examen
                    preventivo y ocupacional.
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: 2,
                      color: "#334155",
                    }}
                  >
                    En Ergosanitas realizamos
                    electrocardiogramas con atención
                    profesional y orientación médica
                    enfocada en la salud cardiovascular
                    y la prevención.
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

            {/* SIDEBAR */}

            <Grid item xs={12} md={4}>

              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  p: 2,
                  background:
                    "linear-gradient(to bottom, #ffffff, #f1f5f9)",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                  position: "sticky",
                  top: 20,
                }}
              >

                <CardContent>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 4,
                      fontSize: "1.7rem",
                    }}
                  >
                    Información
                  </Typography>

                  <Stack spacing={4}>

                    <Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      >
                        Duración
                      </Typography>

                      <Typography color="text.secondary">
                        10 a 15 minutos
                      </Typography>

                    </Box>

                    <Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      >
                        Tipo de examen
                      </Typography>

                      <Typography color="text.secondary">
                        Cardiovascular
                      </Typography>

                    </Box>

                    <Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <LocationOnIcon fontSize="small" />

                        Ubicación
                      </Typography>

                      <Typography color="text.secondary">
                        San Bernardo, Región Metropolitana
                      </Typography>

                    </Box>

                  </Stack>

                </CardContent>

              </Card>

            </Grid>

          </Grid>

        </Container>

      </Box>

    </>

  )
}

export default AppElectrocardiogramaPage;