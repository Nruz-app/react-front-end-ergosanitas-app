import { useState } from 'react';
import {
    Box,
    Chip,
    Collapse,
    IconButton,
    Stack,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { IBioimpedancia } from '../interface';
import { formatFechaCL, formatNumero, formatTexto } from '../utilities/format';
import { Bloque, Dato } from './DetalleCampos';

interface Props {
    bioimpedancia: IBioimpedancia;
}

/**
 * Fila de la tabla de bioimpedancias, con el detalle completo del examen
 * desplegable in-place.
 */
export const BioimpedanciaRow = ({ bioimpedancia: b }: Props) => {

    const [abierto, setAbierto] = useState(false);

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
                    {formatFechaCL(b.fecha)}
                </TableCell>
                <TableCell align="right">{formatNumero(b.imc)}</TableCell>
                <TableCell align="right">{formatNumero(b.pesoKg, 'kg')}</TableCell>
                <TableCell align="right">{formatNumero(b.grasaCorporalPct, '%')}</TableCell>
                <TableCell>
                    {b.tipoCorporal
                        ? <Chip label={b.tipoCorporal} size="small" variant="outlined" />
                        : formatTexto(null)}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell sx={{ py: 0, borderBottom: abierto ? undefined : 'none' }} colSpan={6}>
                    <Collapse in={abierto} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 3, px: { xs: 0, sm: 2 } }}>

                            <Bloque titulo="Composición corporal">
                                <Dato label="Grasa corporal" valor={formatNumero(b.grasaCorporalPct, '%')} />
                                <Dato label="Masa grasa" valor={formatNumero(b.masaGrasaKg, 'kg')} />
                                <Dato label="Grasa subcutánea" valor={formatNumero(b.grasaSubcutaneaPct, '%')} />
                                <Dato label="Grasa visceral" valor={formatNumero(b.grasaVisceral)} />
                                <Dato label="Agua corporal total" valor={formatNumero(b.aguaCorporalTotalKg, 'kg')} />
                                <Dato label="Proteínas" valor={formatNumero(b.proteinasKg, 'kg')} />
                                <Dato label="Minerales" valor={formatNumero(b.mineralesKg, 'kg')} />
                            </Bloque>

                            <Bloque titulo="Masa muscular">
                                <Dato label="Masa muscular" valor={formatNumero(b.masaMuscularKg, 'kg')} />
                                <Dato label="Músculo esquelético" valor={formatNumero(b.masaMusculoEsqueleticoKg, 'kg')} />
                                <Dato label="SMI" valor={formatNumero(b.smi)} />
                                <Dato label="Masa libre de grasa" valor={formatNumero(b.masaLibreGrasaKg, 'kg')} />
                            </Bloque>

                            {/* Masa por segmento, tal como la reporta el equipo. Aquí no se
                                estima nada: lo que no venga medido se muestra como '—'. El
                                reparto por coeficientes vive solo en el tab de distribución
                                segmentaria, que lo declara en pantalla. */}
                            <Bloque titulo="Distribución segmentaria (medida por el equipo)">
                                <Dato label="Grasa tronco" valor={formatNumero(b.grasaTroncoKg, 'kg')} />
                                <Dato label="Músculo tronco" valor={formatNumero(b.musculoTroncoKg, 'kg')} />
                                <Dato label="Grasa brazo izq." valor={formatNumero(b.grasaBrazoIzqKg, 'kg')} />
                                <Dato label="Músculo brazo izq." valor={formatNumero(b.musculoBrazoIzqKg, 'kg')} />
                                <Dato label="Grasa brazo der." valor={formatNumero(b.grasaBrazoDerKg, 'kg')} />
                                <Dato label="Músculo brazo der." valor={formatNumero(b.musculoBrazoDerKg, 'kg')} />
                                <Dato label="Grasa pierna izq." valor={formatNumero(b.grasaPiernaIzqKg, 'kg')} />
                                <Dato label="Músculo pierna izq." valor={formatNumero(b.musculoPiernaIzqKg, 'kg')} />
                                <Dato label="Grasa pierna der." valor={formatNumero(b.grasaPiernaDerKg, 'kg')} />
                                <Dato label="Músculo pierna der." valor={formatNumero(b.musculoPiernaDerKg, 'kg')} />
                            </Bloque>

                            <Bloque titulo="Metabolismo y metas">
                                <Dato label="Tasa metabólica basal" valor={formatNumero(b.tasaMetabolicaBasalKcal, 'kcal')} />
                                <Dato label="Edad corporal" valor={formatNumero(b.edadCorporal, 'años')} />
                                <Dato label="Puntaje corporal" valor={formatNumero(b.puntajeCorporal)} />
                                <Dato label="Peso objetivo" valor={formatNumero(b.pesoObjetivoKg, 'kg')} />
                                <Dato label="Control de peso" valor={formatNumero(b.controlPesoKg, 'kg')} />
                                <Dato label="Control de grasa" valor={formatNumero(b.controlGrasaKg, 'kg')} />
                                <Dato label="Control de músculo" valor={formatNumero(b.controlMusculoKg, 'kg')} />
                                <Dato label="Índice cintura-cadera" valor={formatNumero(b.whr)} />
                            </Bloque>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 0.5, sm: 3 }}
                                sx={{ mt: 1, color: 'text.secondary' }}
                            >
                                <Typography variant="caption">
                                    Estatura: {formatNumero(b.estaturaCm, 'cm')}
                                </Typography>
                                <Typography variant="caption">
                                    Hora: {formatTexto(b.hora)}
                                </Typography>
                                <Typography variant="caption">
                                    Equipo: {formatTexto(b.marca)}
                                </Typography>
                                {/* Trazabilidad de la extracción: el payload sale de leer
                                    el PNG del equipo, así que una extracción de mala
                                    calidad explica un dato raro más arriba. */}
                                <Typography variant="caption">
                                    Extracción: {formatTexto(b.calidadExtraccion)}
                                </Typography>
                                <Typography variant="caption">
                                    Asimetrías: {formatTexto(b.asimetriasRelevantes)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default BioimpedanciaRow;
