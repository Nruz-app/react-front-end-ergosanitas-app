import { ChangeEvent, useId } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { UI } from '../../config/tema';

interface Props {
    typeAccept        : string;
    /** Nombre del Excel elegido, o `null`. Lo controla `CargaMasiva` para poder vaciarlo. */
    fileName          : string | null;
    onFileSelectExcel : (file: File | null) => void;
}

/**
 * Selector del Excel de la carga masiva.
 *
 * El nombre del archivo lo controla el padre: en el original quedaba en pantalla después de
 * subirlo aunque el archivo ya se hubiera descartado, y parecía que seguía elegido. El id sale
 * de `useId` en vez del `id="file-upload-excel"` fijo.
 */
export const FileUploadExcel = ({ typeAccept, fileName, onFileSelectExcel }: Props) => {

    const idInput = useId();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {

        onFileSelectExcel(event.target.files?.[0] ?? null);
        // Permite volver a elegir el mismo archivo después de subirlo.
        event.target.value = '';
    };

    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <input accept={typeAccept} style={{ display: 'none' }} id={idInput} type="file" onChange={handleChange} />
            <label htmlFor={idInput}>
                <Button
                    variant="contained"
                    component="span"
                    color="success"
                    startIcon={<UploadFileIcon aria-hidden="true" />}
                    sx={{ textTransform: 'none', borderRadius: 8, padding: '8px 16px' }}
                >
                    Subir archivo Excel
                </Button>
            </label>
            {fileName && (
                <Box
                    sx={{
                        display        : 'flex',
                        alignItems     : 'center',
                        justifyContent : 'center',
                        gap            : 1,
                        bgcolor        : UI.fondoArchivo,
                        p              : 1.5,
                        borderRadius   : 2,
                        width          : '100%',
                    }}
                >
                    <InsertDriveFileIcon color="primary" aria-hidden="true" />
                    <Typography variant="body2" color="text.primary" fontWeight="500">
                        Excel seleccionado: <strong>{ fileName }</strong>
                    </Typography>
                </Box>
            )}
        </Stack>
    );
};
