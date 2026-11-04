import { useContext, useEffect, useState } from 'react';
import {
    Box, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent,
} from '@mui/material';

import { COLORES, SOMBRAS } from '../../config/tema';
import { LikeTextContext } from '../../context';
import type { IUsuarioRegistrado } from '../../interface';
import { UseUsuarioService } from '../../services';

/** El id de perfil que el backend usa para la lista de clubes. */
const PERFIL_CLUBES = 3;

/**
 * Filtro de la lista por club (`selectClub`).
 *
 * Es la **única** `GET /auth-register/user_email/3` al entrar al módulo: monta con la lista,
 * igual que hoy (criterio de carga diferida). Clon del original sin `UseRegister` de `Login/`.
 *
 * ⚠️ Paridad: el `Select` muestra siempre vacío aunque haya un club elegido (el original
 * fijaba `value=''`), y no hay forma de quitar el filtro de club. Va a la spec de la lista.
 */
export const SelectClub = () => {

    const { onSetLikeText, ...likeTextContext } = useContext(LikeTextContext);
    const [clubes, setClubes] = useState<IUsuarioRegistrado[]>([]);

    useEffect(() => {

        const cargarClubes = async () => {

            try {
                const { getUserEmail } = await UseUsuarioService();
                setClubes(await getUserEmail(PERFIL_CLUBES));
            }
            catch (problema) {
                console.error(problema instanceof Error ? problema.message : 'No hay respuesta del servidor.');
            }
        };

        cargarClubes();

    }, []);

    const onChange = (event: SelectChangeEvent<string>) => {

        const selectClub = event.target.value;
        if (!selectClub) return;

        onSetLikeText({ ...likeTextContext, selectClub });
    };

    return (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                sx={{
                    boxSizing    : 'border-box',
                    p            : { xs: 1.5, sm: 3 },
                    display      : 'flex',
                    alignItems   : 'center',
                    width        : { xs: '100%', sm: '80%' },
                    boxShadow    : SOMBRAS.campo,
                    borderRadius : '12px',
                    border       : `1px solid ${COLORES.borde}`,
                }}
            >
                {clubes.length > 0 && (
                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel id="filtro-club-label">Selecciona un Club</InputLabel>
                        <Select
                            labelId="filtro-club-label"
                            id="filtro-club"
                            label="Selecciona un Club"
                            value=""
                            onChange={onChange}
                            sx={{ borderRadius: '8px' }}
                        >
                            <MenuItem value="" sx={{ color: COLORES.textoSuave }}>
                                <em>Selecciona un Club</em>
                            </MenuItem>
                            {clubes.map((club) => (
                                <MenuItem
                                    key={club.user_email}
                                    value={club.user_email}
                                    sx={{ '&:hover': { backgroundColor: COLORES.fondoSuave } }}
                                >
                                    { club.user_name }
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Paper>
        </Box>
    );
};
