import { Avatar, Box, Card, Chip, Stack, Typography } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import { IPacienteBase } from '../interface';
import { SIN_DATO, formatNumero, formatTexto } from '../utilities/format';

interface Props {
    paciente: IPacienteBase;
}

/**
 * Iniciales (máx. 2) a partir del nombre completo.
 *
 * El backend manda `nombre: null` para los RUT sin ficha demográfica, así que el avatar
 * tiene que resolver ese caso en vez de reventar al llamar `.trim()`.
 */
const getIniciales = (nombre: string | null): string => {

    if (!nombre) return '—';

    return nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join('');
};

export const PacienteHeader = ({ paciente }: Props) => {
    return (
        <Card
            sx={{
                borderRadius: 6,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden',
            }}
        >
            {/* Franja superior con degradado */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    px: { xs: 3, md: 4 },
                    py: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Avatar
                    sx={{
                        width: 88,
                        height: 88,
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: '#fff',
                        fontSize: 32,
                        fontWeight: 700,
                        border: '3px solid rgba(255,255,255,0.6)',
                    }}
                >
                    {getIniciales(paciente.nombre)}
                </Avatar>

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, color: '#fff' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '0.3px' }}>
                        {paciente.nombre ?? 'Paciente sin ficha demográfica'}
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 0.5, alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}
                    >
                        <BadgeIcon fontSize="small" />
                        <Typography variant="body1" sx={{ opacity: 0.95 }}>
                            {paciente.rut}
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Datos rápidos en chips */}
            <Box
                sx={{
                    px: { xs: 3, md: 4 },
                    py: 2.5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    backgroundColor: '#ffffff',
                }}
            >
                {/* El payload del backend solo trae rut, nombre, sexo y fecha de
                    nacimiento: no hay división, email, teléfono ni grupo sanguíneo. Y de
                    esos tres, cualquiera puede venir nulo: se muestra '—', nunca un 0. */}
                <Chip
                    icon={<CakeIcon />}
                    label={paciente.edad === null ? SIN_DATO : formatNumero(paciente.edad, 'años')}
                    variant="outlined"
                />
                <Chip icon={<WcIcon />} label={formatTexto(paciente.sexo)} variant="outlined" />
            </Box>
        </Card>
    );
};

export default PacienteHeader;
