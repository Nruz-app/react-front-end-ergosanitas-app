import { useMemo, useState } from 'react';
import {
    Box, Chip, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { COLORES } from '../config/tema';
import type { ICarrito, ICatalogo } from '../interface';
import { nombrePaciente } from '../utilities';
import { ProductoCard } from './producto-card';

interface Props {
    catalogo   : ICatalogo;
    carrito    : ICarrito;
    cargando   : boolean;
    onAgregar  : (pacienteId: number, sku: string) => void;
    onCotizar  : (sku: string, nombre: string) => void;
}

const TODAS = 'Todas';

/** Minúsculas y sin tildes: «curacion» encuentra «Curación». */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

/**
 * Paso 2: catálogo por categorías con buscador. El filtro es local sobre la lista ya cargada
 * (~230 productos). Si hay varios pacientes, se elige a cuál se le agrega.
 */
export const CatalogoProductos = ({ catalogo, carrito, cargando, onAgregar, onCotizar }: Props) => {

    const [categoria, setCategoria] = useState<string>(catalogo.categorias[0] ?? TODAS);
    const [busqueda, setBusqueda] = useState<string>('');
    const [pacienteId, setPacienteId] = useState<number>(carrito.pacientes[0]?.id ?? 0);

    const paciente = carrito.pacientes.find((p) => p.id === pacienteId) ?? carrito.pacientes[0];
    const enCarro = new Set(paciente?.lineas.map((l) => l.sku) ?? []);

    const productos = useMemo(() => {

        const texto = normalizar(busqueda.trim());

        return catalogo.productos.filter((p) =>
            texto
                ? normalizar(p.nombre).includes(texto)
                : categoria === TODAS || p.categoria === categoria,
        );
    }, [catalogo.productos, categoria, busqueda]);

    return (
        <Stack spacing={3}>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <TextField
                    fullWidth
                    placeholder="Busca un examen o servicio (ej. hemograma, curación)"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />

                {carrito.pacientes.length > 1 && (
                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel id="cf-paciente">Agregar a</InputLabel>
                        <Select labelId="cf-paciente" label="Agregar a" value={paciente?.id ?? ''}
                            onChange={(e) => setPacienteId(Number(e.target.value))}>
                            {carrito.pacientes.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{nombrePaciente(p)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Stack>

            {!busqueda && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[...catalogo.categorias, TODAS].map((c) => (
                        <Chip
                            key={c}
                            label={c.replace('Laboratorio / ', 'Laboratorio · ')}
                            clickable
                            onClick={() => setCategoria(c)}
                            color={c === categoria ? 'primary' : 'default'}
                            variant={c === categoria ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
            )}

            {productos.length === 0 ? (
                <Typography color={COLORES.textoSuave} textAlign="center" sx={{ py: 6 }}>
                    No encontramos productos con ese nombre.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {productos.map((producto) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={producto.sku}>
                            <ProductoCard
                                producto={producto}
                                plan={carrito.plan}
                                enCarro={enCarro.has(producto.sku)}
                                deshabilitado={cargando || !paciente}
                                onAgregar={() => paciente && onAgregar(paciente.id, producto.sku)}
                                onCotizar={() => onCotizar(producto.sku, producto.nombre)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Stack>
    );
};
