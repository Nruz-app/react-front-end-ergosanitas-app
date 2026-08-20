import { useState } from 'react';
import {
    Box,
    Chip,
    ChipProps,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { IElectrocardiograma } from '../interface';
import { formatFechaCL, formatNumero, formatPresion, formatTexto } from '../utilities/format';
import { Bloque, Dato } from './DetalleCampos';

interface Props {
    electro: IElectrocardiograma;
}

/**
 * Color del chip de estado según el valor de `status`.
 *
 * Los valores son los que usa el dominio en el módulo Chequeo
 * (`ChequeoTable.tsx`). Se replica el mapeo en lugar de importarlo para no
 * acoplar el módulo Paciente a los internos de Chequeo.
 */
const colorEstado = (status: string | null): ChipProps['color'] => {

    switch (status) {
        case 'Diag. Card. - Normal':
            return 'success';
        case 'Diag. Card. - Alterado':
            return 'error';
        case 'REVISION MEDICA':
        case 'En Rev. Cardio':
            return 'info';
        case 'Testiado':
            return 'primary';
        case 'ECG FOTO':
            return 'secondary';
        default:
            return 'default';
    }
};

/**
 * Fila de la tabla de electrocardiogramas, con la lectura del ECG y las
 * evaluaciones por sistema desplegables in-place.
 */
export const ElectroRow = ({ electro: e }: Props) => {

    const [abierto, setAbierto] = useState(false);

    const presion = formatPresion(e.presionSistolica, e.presionDiastolica);

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: abierto ? 'unset' : undefined } }}>
                <TableCell sx={{ width: 48 }}>
                    <IconButton
                        size="small"
                        onClick={() => setAbierto(!abierto)}
                        aria-label={abierto ? 'Ocultar detalle' : 'Ver detalle'}
                    >
                        {abierto ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatFechaCL(e.fecha)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {presion ?? formatTexto(null)}
                </TableCell>
                <TableCell align="right">{formatNumero(e.frecuenciaCardiaca)}</TableCell>
                <TableCell align="right">{formatNumero(e.saturacionOxigeno, '%')}</TableCell>
                <TableCell>
                    {e.status
                        ? <Chip label={e.status} size="small" color={colorEstado(e.status)} />
                        : formatTexto(null)}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell sx={{ py: 0, borderBottom: abierto ? undefined : 'none' }} colSpan={6}>
                    <Collapse in={abierto} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 3, px: { xs: 0, sm: 2 } }}>

                            <Bloque titulo="Lectura del electrocardiograma">
                                <Box sx={{ px: 1.5, width: '100%' }}>
                                    {/* `pre-line` conserva los saltos de línea con que el
                                        backend entrega la lectura del ECG. */}
                                    <Typography
                                        variant="body2"
                                        sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}
                                    >
                                        {formatTexto(e.observacion)}
                                    </Typography>
                                </Box>
                            </Bloque>

                            <Bloque titulo="Evaluación por sistema">
                                <Dato label="Cardiovascular" valor={formatTexto(e.sistemaCardiovascular)} />
                                <Dato label="Osteoarticular" valor={formatTexto(e.sistemaOsteoarticular)} />
                                <Dato label="Recuperación" valor={formatTexto(e.recuperacion)} />
                                <Dato label="Grado de incidencia" valor={formatTexto(e.gradoIncidencia)} />
                                <Dato label="Estado del paciente" valor={formatTexto(e.estadoPaciente)} />
                                <Dato label="Derivación" valor={formatTexto(e.derivacion)} />
                            </Bloque>

                            <Bloque titulo="Signos vitales del control">
                                <Dato label="Peso" valor={formatNumero(e.pesoKg, 'kg')} />
                                <Dato label="Estatura" valor={formatNumero(e.estaturaCm, 'cm')} />
                                <Dato label="IMC" valor={formatNumero(e.imc)} />
                                <Dato label="Presión arterial" valor={presion ? `${presion} mmHg` : formatTexto(null)} />
                                <Dato label="Hemoglucotest" valor={formatNumero(e.hemoglucotest, 'mg/dL')} />
                                <Dato label="Temperatura" valor={formatNumero(e.temperatura, '°C')} />
                            </Bloque>

                            <Bloque titulo="Antecedentes declarados en este control">
                                <Dato label="Enfermedades crónicas" valor={formatTexto(e.antecedentes.enfermedadesCronicas)} />
                                <Dato label="Medicamentos diarios" valor={formatTexto(e.antecedentes.medicamentosDiarios)} />
                                <Dato label="Enfermedades anteriores" valor={formatTexto(e.antecedentes.enfermedadesAnteriores)} />
                            </Bloque>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default ElectroRow;
