import { useContext } from "react";

import { Box,  Typography} from "@mui/material"
import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import { ModalContext } from "../../common/context";


//https://mui.com/material-ui/react-button/

const images = [
  {
    url: '/fondoVideo.png',
    title: '¿ Sabes Por que Es Importancia Hacerse un Chequeo Cardiovascular ?',
    width: '100%',
  }
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  height: 150,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    '& .MuiImageBackdrop-root': {
    zIndex: 1,
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      color: theme.palette.common.white,
      backgroundColor: '#00AFFF',
      border: '4px solid currentColor', // Borde blanco alrededor del texto
      padding: '8px 16px', // Espaciado dentro del texto
      borderRadius: '15px', // Bordes redondeados en el texto
    },
  },
})); 

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(() => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));


export const BoxVideo = () => {

  const { onOpenModal }  = useContext( ModalContext );

  const handCLick = () => {
    onOpenModal(true);
  }


  return (
    <Box mt={ 1 } sx={{ flexGrow: 1,textAlign: 'center' }} >
      
    {
      images.map((image) => (

        <ImageButton
          focusRipple
          key={image.title}
          style={{
            width: image.width,
          }}
        >
          <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
          
          <Image>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              onClick={ handCLick }
          
              sx={{
                fontFamily: 'cursive',
                letterSpacing: '.2rem',
                color: '#00AFFF',
                textTransform: 'uppercase',
              }}
            >
              {image.title}
            
            </Typography>
          </Image>
        </ImageButton>
      ))
    }   
    </Box>
  )
}
