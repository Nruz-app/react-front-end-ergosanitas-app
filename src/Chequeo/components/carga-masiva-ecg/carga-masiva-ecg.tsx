import React, { useRef, useState } from "react";

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
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
    DataGrid,
    GridColDef,
} from "@mui/x-data-grid";

import { UseChequeoService } from "../../services/useChequeoService";
import { ICargaMasivaECG } from "../../interface";

interface IResultadoCargaMasiva {
    archivo: string;
    rut: string;
    id_chequeo: number | string;
    nombre: string;
    status: string;
    resultado: "OK" | "ERROR";
    mensaje: string;
}

export const CargaMasivaECG = () => {

    const inputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    const [derivadoMedico, setDerivadoMedico] = useState("NO");

    const [rows, setRows] = useState<IResultadoCargaMasiva[]>([]);

    /*
    ============================================================
    COLUMNAS GRID
    ============================================================
    */

    const columns: GridColDef[] = [
        {
            field: "archivo",
            headerName: "Archivo",
            flex: 1.5,
            minWidth: 220,
        },
        {
            field: "rut",
            headerName: "Rut",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "id_chequeo",
            headerName: "ID",
            flex: 0.6,
            minWidth: 100,
        },
        {
            field: "nombre",
            headerName: "Nombre",
            flex: 1.5,
            minWidth: 220,
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 160,
        },
        {
            field: "resultado",
            headerName: "Resultado",
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={
                        params.value === "OK"
                            ? "success"
                            : "error"
                    }
                    variant="filled"
                    sx={{
                        fontWeight: 700,
                        width: 100,
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

    const handleFiles = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        try {

            const archivos = Array.from(
                event.target.files || []
            );

            if (archivos.length === 0) return;

            setLoading(true);

            const formData = new FormData();

            archivos.forEach((file) => {
                formData.append("files", file);
            });

            const { cargaMasivaECG } =
                await UseChequeoService();

            const response:ICargaMasivaECG = await cargaMasivaECG(derivadoMedico,formData);

            console.log(response);

            /*
            ============================================================
            SET GRID
            ============================================================
            */

            const data = response.procesados.map(
                (item: IResultadoCargaMasiva, index: number) => ({
                    id: index + 1,
                    ...item,
                })
            );

            setRows(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };

    return (
        <Box
            sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Grid
                container
                justifyContent="center"
                spacing={4}
            >
                <Grid item xs={12} md={11} lg={10}>

                    {/* TITULO */}

                    <Box
                        sx={{
                            textAlign: "center",
                            mb: 4,
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                textTransform: "uppercase",
                            }}
                        >
                            Cargar Masiva ECG
                        </Typography>
                    </Box>

                    {/* CARD */}

                    <Paper
                        elevation={10}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                        }}
                    >

                        <Grid container spacing={4}>

                            {/* SELECT */}

                            <Grid item xs={12} md={4}>

                                <FormControl fullWidth>

                                    <InputLabel>
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
                                            borderRadius: 3,
                                            backgroundColor: "#fafafa",
                                        }}
                                    >
                                        <MenuItem value="NO">
                                            NO
                                        </MenuItem>

                                        <MenuItem value="SI">
                                            SI
                                        </MenuItem>

                                    </Select>

                                </FormControl>

                            </Grid>

                            {/* DROPZONE */}

                            <Grid item xs={12}>

                                <Box
                                    sx={{
                                        border: "2px dashed",
                                        borderColor: "divider",
                                        borderRadius: 4,
                                        p: 6,
                                        textAlign: "center",
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: loading ? 0.7 : 1,
                                        transition: "0.3s",
                                        background:
                                            "linear-gradient(145deg, #fafafa, #ffffff)",

                                        "&:hover": {
                                            borderColor:
                                                "primary.main",
                                            backgroundColor:
                                                "#f8fbff",
                                            transform:
                                                "translateY(-3px)",
                                        },
                                    }}
                                    onClick={() => {
                                        if (!loading) {
                                            inputRef.current?.click();
                                        }
                                    }}
                                >

                                    {
                                        loading ? (
                                            <CircularProgress
                                                size={70}
                                            />
                                        ) : (
                                            <UploadFileIcon
                                                sx={{
                                                    fontSize: 80,
                                                    color: "primary.main",
                                                    mb: 2,
                                                }}
                                            />
                                        )
                                    }

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        mb={1}
                                    >
                                        Seleccionar Archivos
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        Haz click aquí para cargar
                                        múltiples ECG
                                    </Typography>

                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        ref={inputRef}
                                        onChange={handleFiles}
                                    />

                                </Box>

                            </Grid>

                            {/* GRID */}

                            <Grid item xs={12}>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        height: 500,
                                        width: "100%",
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        border:
                                            "1px solid #e0e0e0",
                                    }}
                                >

                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSizeOptions={[5, 10, 20]}
                                        disableRowSelectionOnClick
                                        density="comfortable"
                                        sx={{
                                            border: 0,

                                            "& .MuiDataGrid-columnHeaders":
                                            {
                                                backgroundColor:
                                                    "#f5f7fa",
                                                fontSize: 15,
                                                fontWeight: 700,
                                            },

                                            "& .MuiDataGrid-cell":
                                            {
                                                fontSize: 14,
                                            },

                                            "& .MuiDataGrid-row:hover":
                                            {
                                                backgroundColor:
                                                    "#f9fbff",
                                            },
                                        }}
                                    />

                                </Paper>

                            </Grid>

                        </Grid>

                    </Paper>

                </Grid>
            </Grid>
        </Box>
    );
}