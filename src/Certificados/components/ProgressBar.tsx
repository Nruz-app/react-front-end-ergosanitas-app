import { Box, Grid } from "@mui/material"

import ProgressBar from '@ramonak/react-progress-bar';
import { useContext, useEffect, useRef } from "react";
import { CertificadoContext } from "../context";


export const ProgressBarLoading = () => {

    //npm i @types/node -D 
    const debounceRef = useRef<NodeJS.Timeout>();

    const { completed,onSetCertificado, ...certificadoContext }  = useContext( CertificadoContext );  
    
    useEffect( ()=> {

      if ( debounceRef.current )
        clearTimeout( debounceRef.current )
    
      debounceRef.current = setTimeout( ()=>{
    
        if(completed > 100) {
          
          onSetCertificado( {
            ...certificadoContext,
            completed: 0,
            banner : true
          } );

        }
        else {
          const newCompleted = completed + 20;

          onSetCertificado( {
            ...certificadoContext,
            completed: newCompleted,
            banner : false
          } );
        }

  
      }, 1200 )

    },[completed])



  return (
    <Box mt={4} sx={{ alignItems: 'center', textAlign: 'center' }} >
      <Grid container spacing={2}>
        <Grid item xs={4} />
        <Grid item xs={8}>
            <ProgressBar 
            completed={ completed } 
            customLabel="Espere por favor..."
            animateOnRender={true}
            bgColor="#3f51b5"
            baseBgColor="#e0e0e0"
            labelColor="#fff"
            height="20px"
            width='600px'
            borderRadius="5px"
            labelAlignment="center"
            /> 
        </Grid>
        </Grid>
    </Box> 
  )
}
