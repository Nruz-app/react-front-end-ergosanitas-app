import React, { useMemo, useRef, useState } from "react";

import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Fade,
  Stack,
  Divider,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";

import { UseChequeoService } from "../../services/useChequeoService";

import {ICargaMasivaECG,ÏProcesados} from "../../interface";

interface Props {
  handleReloadTable: () => void;
}

export const CargaMasivaECG = ({handleReloadTable}: Props) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [derivadoMedico, setDerivadoMedico] =useState("NO");

  const [rows, setRows] = useState<ÏProcesados[]>([]);

  /*
  ============================================================
  ESTADISTICAS
  ============================================================
  */

  const totalOK = useMemo(
    () =>
      rows.filter(
        (row) => row.resultado === "OK"
      ).length,
    [rows]
  );

  const totalError = useMemo(
    () =>
      rows.filter(
        (row) => row.resultado === "ERROR"
      ).length,
    [rows]
  );


  const columns: GridColDef[] = [
    {
      field: "archivo",
      headerName: "Archivo",
      flex: 1.4,
      minWidth: 220,
    },
    {
      field: "rut",
      headerName: "Rut",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "id_chequeo",
      headerName: "ID",
      flex: 0.5,
      minWidth: 90,
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1.4,
      minWidth: 220,
    },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="info"
          size="small"
          sx={{
            fontWeight: 700,
            borderRadius: 2,
          }}
        />
      ),
    },
    {
      field: "resultado",
      headerName: "Resultado",
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Chip
          icon={
            params.value === "OK"
              ? <CheckCircleIcon />
              : <ErrorIcon />
          }
          label={params.value}
          color={
            params.value === "OK"
              ? "success"
              : "error"
          }
          variant="filled"
          sx={{
            fontWeight: 700,
            width: 110,
            borderRadius: 3,
          }}
        />
      ),
    },
    {
      field: "mensaje",
      headerName: "Mensaje",
      flex: 2,
      minWidth: 320,
    },
  ];

  /*
  ============================================================
  CARGA ARCHIVOS
  ============================================================
  */

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {

    try {

      const archivos = Array.from(event.target.files || []);

      if (archivos.length === 0) return;

      setLoading(true);

      const formData = new FormData();

      archivos.forEach((file) => {
        formData.append("files", file);
      });

      const { cargaMasivaECG } = await UseChequeoService();

      const response: ICargaMasivaECG = await cargaMasivaECG(derivadoMedico,formData);

      const data = response.procesados.map(
        (
          item: ÏProcesados,
          index: number
        ) => ({
          id: index + 1,
          ...item,
        })
      );

      setRows(data);

      /*
      ============================================================
      REFRESH TABLA PRINCIPAL
      ============================================================
      */

      handleReloadTable();

    } 
    catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fade in timeout={500}>

      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          p: {
            xs: 1,
            sm: 2,
            md: 3,
          },
        }}
      >

        {/* HEADER */}

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: {
              xs: 3,
              md: 4,
            },
            borderRadius: 5,
            background:
              "linear-gradient(135deg,#0f172a 0%, #1976d2 100%)",
            color: "white",
            overflow: "hidden",
            position: "relative",

            "&::before": {
              content: '""',
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.08)",
              top: -100,
              right: -60,
            }
          }}
        >

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={3}
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            justifyContent="space-between"
          >

            <Box>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                mb={1}
              >

                <MonitorHeartIcon
                  sx={{
                    fontSize: 42,
                  }}
                />

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  Carga Masiva ECG
                </Typography>

              </Stack>

            </Box>

            {/* SELECT */}

            <Box
              sx={{
                width: {
                  xs: "100%",
                  md: 260,
                },
              }}
            >

              <FormControl fullWidth>

                <InputLabel
                  sx={{
                    color: "white",
                  }}
                >
                  Derivado Médico
                </InputLabel>

                <Select
                  value={derivadoMedico}
                  label="Derivado Médico"
                  onChange={(e) =>
                    setDerivadoMedico(
                      e.target.value
                    )
                  }
                  sx={{
                    borderRadius: 4,
                    backgroundColor:
                      "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                    color: "white",

                    "& .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor:
                        "rgba(255,255,255,0.25)",
                    },

                    "& .MuiSvgIcon-root": {
                      color: "white",
                    },
                  }}
                >

                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="SI">SI</MenuItem>

                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Paper>

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
        >

          <Grid item xs={12} sm={4}>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border:
                  "1px solid rgba(25,118,210,0.15)",
                background:
                  "linear-gradient(135deg,#ffffff,#f8fbff)",
              }}
            >

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Procesados
              </Typography>

              <Typography
                variant="h4"
                fontWeight={800}
              >
                {rows.length}
              </Typography>

            </Paper>

          </Grid>

          <Grid item xs={12} sm={4}>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border:
                  "1px solid rgba(76,175,80,0.15)",
                background:
                  "linear-gradient(135deg,#ffffff,#f6fff7)",
              }}
            >

              <Typography
                variant="body2"
                color="text.secondary"
              >
                ECG Correctos
              </Typography>

              <Typography
                variant="h4"
                fontWeight={800}
                color="success.main"
              >
                {totalOK}
              </Typography>

            </Paper>

          </Grid>

          <Grid item xs={12} sm={4}>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border:
                  "1px solid rgba(244,67,54,0.15)",
                background:
                  "linear-gradient(135deg,#ffffff,#fff7f7)",
              }}
            >

              <Typography
                variant="body2"
                color="text.secondary"
              >
                ECG con Error
              </Typography>

              <Typography
                variant="h4"
                fontWeight={800}
                color="error.main"
              >
                {totalError}
              </Typography>

            </Paper>

          </Grid>

        </Grid>

        {/* DROPZONE */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
            borderRadius: 5,
            border:
              "2px dashed rgba(25,118,210,0.2)",
            background:
              "linear-gradient(145deg,#ffffff,#f8fbff)",
            transition: "all .3s ease",
            cursor: loading
              ? "not-allowed"
              : "pointer",

            "&:hover": {
              transform: "translateY(-4px)",
              borderColor: "primary.main",
              boxShadow:
                "0 12px 30px rgba(25,118,210,0.12)",
            }
          }}
          onClick={() => {
            if (!loading) {
              inputRef.current?.click();
            }
          }}
        >

          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >

            {
              loading ? (
                <CircularProgress size={70} />
              ) : (
                <UploadFileIcon
                  sx={{
                    fontSize: 90,
                    color: "primary.main",
                  }}
                />
              )
            }

            <Typography
              variant="h5"
              fontWeight={800}
              textAlign="center"
            >
              Seleccionar ECG
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              maxWidth={650}
            >
              Haz click aquí para cargar múltiples
              electrocardiogramas PDF y procesarlos
              automáticamente.
            </Typography>

            <Divider
              sx={{
                width: "100%",
                maxWidth: 500,
              }}
            />

            <Chip
              label="Carga múltiple habilitada"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 700,
                borderRadius: 3,
                px: 1,
              }}
            />

          </Stack>

          <input
            type="file"
            multiple
            hidden
            ref={inputRef}
            onChange={handleFiles}
          />

        </Paper>

        {/* GRID */}

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: 5,
            overflow: "hidden",
            border:
              "1px solid rgba(0,0,0,0.08)",
          }}
        >

          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 20, 50]}
            disableRowSelectionOnClick
            density="comfortable"
            autoHeight
            sx={{
              border: 0,

              "& .MuiDataGrid-columnHeaders": {
                background:
                  "linear-gradient(90deg,#1976d2,#42a5f5)",
                color: "white",
                fontSize: 14,
                fontWeight: 800,
              },

              "& .MuiDataGrid-cell": {
                fontSize: 14,
                borderColor:
                  "rgba(0,0,0,0.04)",
              },

              "& .MuiDataGrid-row:hover": {
                backgroundColor:
                  "rgba(25,118,210,0.05)",
              },

              "& .MuiDataGrid-footerContainer":
              {
                borderTop:
                  "1px solid rgba(0,0,0,0.06)",
              },
            }}
          />

        </Paper>

      </Box>

    </Fade>
  );
}