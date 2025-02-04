import { Box, Button,  Grid,  IconButton, Modal  } from "@mui/material"
import { useContext } from "react";
import CancelSharpIcon from '@mui/icons-material/CancelSharp';

import {  Close  } from '@mui/icons-material';

/*
* * Link
* * - https://blog.openreplay.com/building-a-video-player-with-React-and-Material-UI/
*/

import ReactPlayer from 'react-player';
import { ModalContext } from "../../common/context";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
  };

export const VideoPlay = () => {
  

  const { isDateModalOpen,onOpenModal }  = useContext( ModalContext );

  const handleClose = () => {
    onOpenModal(false);
   
  }

  return (
    <Modal
        keepMounted
        open={ isDateModalOpen }
        onClose={ handleClose }
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
    >
        <Box sx={style} >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
            <Close />
            </IconButton>
            <Grid container spacing={2} direction="column" alignItems="center">
            <Grid item>
                <ReactPlayer
                    playing={ isDateModalOpen }
                    muted={false}
                    controls={true}
                    url="https://www.youtube.com/watch?v=JI_xaVcdNSM"
                    width="100%"
                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                />
            </Grid>
            <Grid item sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="error"
              onClick={ handleClose }
              startIcon={ <CancelSharpIcon /> }
              sx={{
                mt: 2,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              Cerrar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}
