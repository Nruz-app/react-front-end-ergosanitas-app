import { useContext } from "react";
import { Box, Modal } from "@mui/material"
import { ModalContext } from "../../common/context";

import { AppLoginGooglePage } from '../../LoginGoogle/pages/AppLoginGooglePage';


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

export const RegisterGoogle = () => {

  
  //const { ValidLogin }  = useContext( LoginContext );

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
          <AppLoginGooglePage />
    </Box>
    </Modal>
  )
}

