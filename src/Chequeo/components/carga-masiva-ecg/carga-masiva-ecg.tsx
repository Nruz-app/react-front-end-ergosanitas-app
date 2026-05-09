import React, { useMemo, useRef, useState } from "react";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";

import { UseChequeoService } from "../../services/useChequeoService";

import {
  ICargaMasivaECG,
  ÏProcesados,
} from "../../interface";

interface Props {
  handleReloadTable: () => void;
}

export const CargaMasivaECG = ({ handleReloadTable }: Props) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [derivadoMedico, setDerivadoMedico] = useState("NO");

  const [rows, setRows] = useState<ÏProcesados[]>([]);

  //ESTADISTICAS
  const totalOK = useMemo(() => {
    return rows.filter(
      (x) => x.resultado === "OK"
    ).length;
  }, [rows]);

  const totalError = useMemo(() => {
    return rows.filter(
      (x) => x.resultado === "ERROR"
    ).length;
  }, [rows]);

  const columns: GridColDef[] = [
    {
      field: "archivo",
      headerName: "Archivo",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "rut",
      headerName: "Rut",
      width: 130,
    },
    {
      field: "nombre",
      headerName: "Paciente",
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: "resultado",
      headerName: "Resultado",
      width: 120,

      renderCell: (params) => (
        <Chip
          size="small"
          icon={
            params.value === "OK"
              ? <CheckCircleRoundedIcon />
              : <ErrorRoundedIcon />
          }
          label={params.value}
          color={
            params.value === "OK"
              ? "success"
              : "error"
          }
          sx={{
            width: 95,
            fontWeight: 700,
          }}
        />
      ),
    },

    {
      field: "mensaje",
      headerName: "Mensaje",
      flex: 2,
      minWidth: 220,
    },
  ];

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {

    try {

      const archivos = Array.from(event.target.files || []);

      if (archivos.length === 0) return;

      setLoading(true);

      const formData = new FormData();

      archivos.forEach((file) => {
        formData.append("files[]", file);
      });

      const { cargaMasivaECG } = await UseChequeoService();

      const response: ICargaMasivaECG = await cargaMasivaECG(derivadoMedico,formData);

      const data = response.procesados.map(
        (item, index) => ({
          id: index + 1,
          ...item,
        })
      );

      setRows(data);

      handleReloadTable();

    } 
    catch (error) {
        console.error(error);
    } 
    finally {
      setLoading(false);
    }
  }

  return (

    <Box sx={{ width: "100%" }}>

      
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
        }}
      >

        <Grid
          container
          spacing={2}
          alignItems="center"
        >

          <Grid item xs={12} md={5}>

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Carga Masiva ECG
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Subida múltiple de PDFs
            </Typography>

          </Grid>

          <Grid item xs={12} md={3}>

            <Select
              fullWidth
              size="small"
              value={derivadoMedico}
              onChange={(e) =>
                setDerivadoMedico(
                  e.target.value
                )
              }
            >

              <MenuItem value="NO">NO</MenuItem>
              <MenuItem value="SI">SI</MenuItem>
            </Select>

          </Grid>
          <Grid item xs={12} md={4}>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                loading
                  ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  )
                  : (
                    <UploadFileRoundedIcon />
                  )
              }
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              sx={{
                borderRadius: 2,
                height: 42,
                fontWeight: 700,
              }}
            >
            { loading ? "Procesando..." : "Subir ECG PDF"}
            </Button>

            <input
              hidden
              multiple
              type="file"
              ref={inputRef}
              onChange={handleFiles}
            />

          </Grid>

        </Grid>

      </Paper>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2 }}
      >

        <Chip
          label={`Procesados: ${rows.length}`}
          color="primary"
        />

        <Chip
          label={`OK: ${totalOK}`}
          color="success"
        />

        <Chip
          label={`Error: ${totalError}`}
          color="error"
        />

      </Stack>


      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >

        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          rowHeight={38}
          sx={{
            border: 0,

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              borderBottom:
                "1px solid #e5e7eb",
            },

            "& .MuiDataGrid-columnHeaderTitle":
            {
              fontWeight: 700,
              fontSize: 13,
            },

            "& .MuiDataGrid-cell": {
              fontSize: 12,
              borderColor: "#f1f5f9",
            },

            "& .MuiDataGrid-footerContainer":
            {
              minHeight: 40,
            },
          }}
        />

      </Paper>

    </Box>
  );
}