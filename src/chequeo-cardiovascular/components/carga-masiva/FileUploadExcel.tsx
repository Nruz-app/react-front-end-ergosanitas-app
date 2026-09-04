import { ChangeEvent, DragEvent, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const TIPOS_ACEPTADOS = [
    '.xlsx', '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
].join(', ');

interface Props {
    archivo          : File | null;
    onSeleccionar    : (file: File | null) => void;
}

/**
 * Zona de arrastrar y soltar para el Excel de carga masiva.
 *
 * El original era solo un botón. Se conserva el botón —arrastrar no funciona con teclado ni en
 * móvil— y se añade la zona de soltar encima, que es como la gente espera subir un archivo.
 */
export const FileUploadExcel = ({ archivo, onSeleccionar }: Props) => {

    const [arrastrando, setArrastrando] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0] ?? null;
        onSeleccionar(file);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {

        event.preventDefault();
        setArrastrando(false);
        onSeleccionar(event.dataTransfer.files?.[0] ?? null);
    };

    return (
        <Box
            onDragOver={(event) => { event.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleDrop}
            sx={{
                border          : '2px dashed',
                borderColor     : arrastrando ? '#1976d2' : '#c5cae9',
                backgroundColor : arrastrando ? '#e3f2fd' : '#fafafa',
                borderRadius    : 2.5,
                p               : { xs: 3, md: 4 },
                textAlign       : 'center',
                transition      : 'border-color 0.2s, background-color 0.2s',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            <UploadFileIcon sx={{ fontSize: 38, color: '#1976d2', mb: 1 }} aria-hidden="true" />

            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                Arrastra aquí el archivo Excel
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                o selecciónalo desde tu equipo · formatos .xlsx y .xls
            </Typography>

            <input
                accept={TIPOS_ACEPTADOS}
                style={{ display: 'none' }}
                id="file-upload-excel"
                type="file"
                onChange={handleChange}
            />
            <label htmlFor="file-upload-excel">
                <Button
                    variant="outlined"
                    component="span"
                    size="small"
                    sx={{
                        textTransform : 'none',
                        fontWeight    : 600,
                        borderRadius  : 2,
                        borderColor   : '#1976d2',
                        color         : '#1976d2',
                        '&:hover'     : { borderColor: '#0d47a1', backgroundColor: '#e3f2fd' },
                    }}
                >
                    Seleccionar archivo
                </Button>
            </label>

            { archivo && (
                <Box
                    sx={{
                        display        : 'flex',
                        alignItems     : 'center',
                        justifyContent : 'center',
                        gap            : 1,
                        mt             : 2,
                        p              : 1.5,
                        backgroundColor: '#fff',
                        border         : '1px solid #e0e0e0',
                        borderRadius   : 2,
                    }}
                >
                    <InsertDriveFileIcon sx={{ color: '#1976d2' }} aria-hidden="true" />
                    <Typography sx={{ fontSize: 13, wordBreak: 'break-all' }}>
                        <strong>{ archivo.name }</strong>
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
