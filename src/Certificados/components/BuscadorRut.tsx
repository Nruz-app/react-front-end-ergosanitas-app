import { FormEvent, useState } from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import textos from '../config/textos-certificados.json';
import { REGEX_RUT, limpiarRut } from '../utilities';

interface Props {
    cargando: boolean;
    onBuscar: (rut: string) => void;
    onLimpiar: () => void;
}

/**
 * Buscador por RUT de la página pública. Enter envía; la validación es local y el back vuelve
 * a validar (422) por si acaso.
 */
export const BuscadorRut = ({ cargando, onBuscar, onLimpiar }: Props) => {

    const [valor, setValor] = useState('');
    const [error, setError] = useState<string | null>(null);

    const onSubmit = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        const rut = limpiarRut(valor);

        if (rut === '') {
            setError(textos.buscador.requerido);
            return;
        }

        if (!REGEX_RUT.test(rut)) {
            setError(textos.buscador.formatoInvalido);
            return;
        }

        setError(null);
        onBuscar(rut);
    };

    const limpiar = () => {
        setValor('');
        setError(null);
        onLimpiar();
    };

    return (
        <Paper
            component="form"
            role="search"
            noValidate
            onSubmit={onSubmit}
            elevation={2}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    gap: 1.5,
                }}
            >
                <TextField
                    id="certificados-rut"
                    label={textos.buscador.etiqueta}
                    placeholder={textos.buscador.placeholder}
                    value={valor}
                    onChange={(evento) => setValor(evento.target.value)}
                    error={error !== null}
                    helperText={error ?? textos.buscador.ayuda}
                    autoComplete="off"
                    fullWidth
                    inputProps={{ inputMode: 'text', maxLength: 12 }}
                />

                <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, pt: { sm: 1 } }}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SearchIcon />}
                        disabled={cargando}
                        sx={{ flex: { xs: 1, sm: 'none' }, textTransform: 'none', fontWeight: 600 }}
                    >
                        {textos.buscador.buscar}
                    </Button>

                    <Button
                        type="button"
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={limpiar}
                        disabled={cargando}
                        sx={{ flex: { xs: 1, sm: 'none' }, textTransform: 'none', fontWeight: 600 }}
                    >
                        {textos.buscador.limpiar}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};
