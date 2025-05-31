import { CardIdentificacionEmerfencia } from './card/card-identificacion-emerfencia';
import { CardDias } from './card/card-dias';

import { Box, Card, Grid } from "@mui/material"

export const ListIncidenciasDeportivas = () => {
    return (
        <Box sx={{ mx: 'auto', mt: 4,width: '80%', }}>
            <Card sx={{ boxShadow: 5, borderRadius: 4, backgroundColor: '#E3F2FD', mb: 4 }}>
                <CardIdentificacionEmerfencia />
            </Card>

            <Grid container spacing={3}>
               <CardDias />
            </Grid>
        </Box>
    );
};