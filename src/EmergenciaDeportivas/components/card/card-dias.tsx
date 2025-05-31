
import { Card, CardActionArea, CardContent, Typography,  Grid } from "@mui/material"

import HeartBrokenIcon from '@mui/icons-material/HeartBroken';

import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HealingIcon from '@mui/icons-material/Healing';


export const CardDias = () => {
  return (
    <>
     <Grid item xs={12} sm={4}>
        <Card sx={{ boxShadow: 5, borderRadius: 4, backgroundColor: '#FFF3E0' }}>
            <CardActionArea>
                <CardContent sx={{ textAlign: 'center' }}>
                    <HeartBrokenIcon sx={{ fontSize: 40, color: 'red' }} />
                    <Typography variant="h6">34</Typography>
                    <Typography variant="body2">Días sin lesiones graves</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Grid>

    <Grid item xs={12} sm={4}>
        <Card sx={{ boxShadow: 5, borderRadius: 4, backgroundColor: '#FFF8E1' }}>
            <CardActionArea>
                <CardContent sx={{ textAlign: 'center' }}>
                    <ReportProblemIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                    <Typography variant="h6">34</Typography>
                    <Typography variant="body2">Días sin lesiones moderadas</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Grid>

    <Grid item xs={12} sm={4}>
        <Card sx={{ boxShadow: 5, borderRadius: 4, backgroundColor: '#FBE9E7' }}>
            <CardActionArea>
                <CardContent sx={{ textAlign: 'center' }}>
                    <HealingIcon sx={{ fontSize: 40, color: 'green' }} />
                    <Typography variant="h6">34</Typography>
                    <Typography variant="body2">Días sin lesiones leves</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Grid>
    </>
  )
}
