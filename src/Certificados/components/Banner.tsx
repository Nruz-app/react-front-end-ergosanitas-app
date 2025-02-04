import 'react-slideshow-image/dist/styles.css'
import { Fade } from 'react-slideshow-image';
import { Box, Card, CardActionArea,  CardMedia, Grid } from '@mui/material';
import { ProgressBarLoading } from './ProgressBar';
import { useContext } from 'react';
import { CertificadoContext } from '../context';
import { DownloadFile } from './DownloadFile';

import slideImages from '../config/list-banner.json';

export const Banner = () => {

  const { banner }  = useContext( CertificadoContext );

  return (
    <Box mt={ 1 } sx={{ flexGrow: 0,alignItems: 'center' }} > 
      <Grid container spacing={2}>
      <Grid item xs={4} />
      <Grid item xs={8}>
      <Fade arrows= { false } duration={ 1000}  cssClass='centered-slider'>
      {
        slideImages.map( ( { order,url,caption}) => (
            
          <Card 
            key={ order }
            sx={{ 
                maxWidth: 600, 
                boxShadow: 3, 
                borderRadius: 3, 
            }}
          >
          <CardActionArea>
            <CardMedia
              component="img"
              image={ url }
              alt= { caption }
              sx={{
                height: 300,
                width: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            </CardActionArea>
          </Card>
        ))
      }
      </Fade>
      </Grid>
    </Grid>
    {
      (!banner) ? ( <ProgressBarLoading /> ) : ( <DownloadFile />)  
    }
    
    </Box>    
  )
}
