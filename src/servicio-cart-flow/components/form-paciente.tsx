import {
    Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography,
} from '@mui/material';

import { PREVISIONES } from '../config/textos';
import { COLORES } from '../config/tema';
import type { IPacienteCarro, IPacienteForm } from '../interface';
import { edadA, nombrePaciente } from '../utilities';
import { PreparacionConsolidada } from './preparacion-consolidada';

interface Props {
    paciente : IPacienteCarro;
    valores  : IPacienteForm;
    errores  : Partial<Record<keyof IPacienteForm, string>>;
    onCambiar: <K extends keyof IPacienteForm>(campo: K, valor: IPacienteForm[K]) => void;
}

/** Datos de un paciente. Si es menor de 18 se piden los datos y el consentimiento del apoderado. */
export const FormPaciente = ({ paciente, valores, errores, onCambiar }: Props) => {

    const edad = edadA(valores.fecha_nac);
    const menor = edad !== null && edad < 18;

    const texto = (campo: keyof IPacienteForm, etiqueta: string, extra: Record<string, unknown> = {}) => (
        <TextField
            fullWidth
            label={etiqueta}
            value={valores[campo] as string}
            onChange={(e) => onCambiar(campo, e.target.value as never)}
            error={!!errores[campo]}
            helperText={errores[campo]}
            {...extra}
        />
    );

    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>

            <Typography fontWeight="bold" color={COLORES.navy} sx={{ mb: 0.5 }}>{nombrePaciente(paciente)}</Typography>
            <Typography variant="body2" color={COLORES.textoSuave} sx={{ mb: 2 }}>
                {paciente.lineas.filter((l) => !l.automatica).map((l) => l.nombre).join(' · ') || 'Sin servicios'}
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>{texto('nombre', 'Nombre completo', { autoComplete: 'name' })}</Grid>
                <Grid item xs={12} md={6}>{texto('rut', 'RUT', { placeholder: '12345678-9' })}</Grid>
                <Grid item xs={12} md={4}>
                    {texto('fecha_nac', 'Fecha de nacimiento', { type: 'date', InputLabelProps: { shrink: true } })}
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errores.sexo}>
                        <InputLabel id={`sexo-${paciente.id}`}>Sexo</InputLabel>
                        <Select labelId={`sexo-${paciente.id}`} label="Sexo" value={valores.sexo}
                            onChange={(e) => onCambiar('sexo', e.target.value as IPacienteForm['sexo'])}>
                            <MenuItem value="F">Femenino</MenuItem>
                            <MenuItem value="M">Masculino</MenuItem>
                        </Select>
                        {errores.sexo && <FormHelperText>{errores.sexo}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errores.prevision}>
                        <InputLabel id={`prev-${paciente.id}`}>Previsión</InputLabel>
                        <Select labelId={`prev-${paciente.id}`} label="Previsión" value={valores.prevision}
                            onChange={(e) => onCambiar('prevision', e.target.value)}>
                            {PREVISIONES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </Select>
                        {errores.prevision && <FormHelperText>{errores.prevision}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>{texto('telefono', 'Teléfono (opcional)', { placeholder: '+56912345678', autoComplete: 'tel' })}</Grid>
                <Grid item xs={12} md={6}>{texto('email', 'Correo (opcional)', { type: 'email', autoComplete: 'email' })}</Grid>

                {menor && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="body2" fontWeight="bold" color={COLORES.navy}>
                                Paciente menor de edad: datos del apoderado
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>{texto('apoderado_nombre', 'Nombre del apoderado')}</Grid>
                        <Grid item xs={12} md={6}>{texto('apoderado_rut', 'RUT del apoderado', { placeholder: '12345678-9' })}</Grid>
                        <Grid item xs={12}>
                            <FormControl error={!!errores.consentimiento_apoderado}>
                                <FormControlLabel
                                    control={<Checkbox checked={valores.consentimiento_apoderado}
                                        onChange={(e) => onCambiar('consentimiento_apoderado', e.target.checked)} />}
                                    label="Como apoderado, autorizo la atención del menor."
                                />
                                {errores.consentimiento_apoderado && <FormHelperText>{errores.consentimiento_apoderado}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    </>
                )}

                <Grid item xs={12}>
                    <FormControl error={!!errores.consentimiento}>
                        <FormControlLabel
                            control={<Checkbox checked={valores.consentimiento}
                                onChange={(e) => onCambiar('consentimiento', e.target.checked)} />}
                            label="Acepto la atención y el tratamiento de mis datos de salud para esta visita. Los resultados llegan solo al paciente."
                        />
                        {errores.consentimiento && <FormHelperText>{errores.consentimiento}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <PreparacionConsolidada titulo="Preparación" preparacion={paciente.preparacion} />
                </Grid>
            </Grid>
        </Paper>
    );
};
