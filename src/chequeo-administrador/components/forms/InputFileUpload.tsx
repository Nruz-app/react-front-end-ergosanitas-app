import { ChangeEvent, useId } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import { UI } from '../../config/tema';

interface Props {
    /** Valor del atributo `accept` del input, p. ej. `"image/*,application/pdf"`. */
    typeAccept   : string;
    /**
     * Nombre del archivo elegido, o `null`. Lo controla el padre: el modal es `keepMounted`, y
     * con el nombre como estado propio seguía a la vista al cerrar o tras subir, también al
     * abrir el modal desde la fila de **otro paciente**, con el botón «Cargar» ya deshabilitado.
     */
    fileName     : string | null;
    onFileSelect : (file: File | null) => void;
}

/**
 * Selector de un archivo con botón y nombre del elegido. Lo usa el modal «Subir archivo».
 *
 * El original fijaba `id="file-upload"`: dos instancias en la misma página compartían id y el
 * `<label>` de la segunda abría el input de la primera. Aquí el id sale de `useId`.
 */
export const InputFileUpload = ({ typeAccept, fileName, onFileSelect }: Props) => {

    const idInput = useId();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {

        onFileSelect(event.target.files?.[0] ?? null);
        // Permite volver a elegir el mismo archivo después de subirlo o de cerrar el modal.
        event.target.value = '';
    };

    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <input
                accept={typeAccept}
                style={{ display: 'none' }}
                id={idInput}
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor={idInput}>
                <Button
                    variant="contained"
                    component="span"
                    color="primary"
                    startIcon={<UploadFileIcon aria-hidden="true" />}
                    sx={{ textTransform: 'none', borderRadius: 8, padding: '8px 16px' }}
                >
                    Subir archivo
                </Button>
            </label>
            {
                fileName && (
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
                            Archivo seleccionado: <strong>{ fileName }</strong>
                        </Typography>
                    </Box>
                )
            }
        </Stack>
    );
};
