

import { Box, Grid, List, ListItemButton, ListItemIcon, ListItemText,  Paper } from '@mui/material'
import fromJson from '../config/custom-likes.json';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { TextInputBaseLike } from '../../Chequeo/components/forms/TextInputBaseLike';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';


import { UseAgendaHoraService } from '../../AgendarHora/services/useAgendaHoraService';
import { IServicios } from '../../AgendarHora/interface';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { LikeTextContext } from '../context/LikeTextContext';

interface Props {
    style?: React.CSSProperties; 
    onPress ?: () => void;
}

const initialValues: { [key: string] : any } = {};

const fieldValidations : { [key:string]: any} = {};

for ( const input of fromJson ) {

    initialValues [ input.name ] = input.value;

    //Validaciones de los campos
    if(  !input.validations ) continue;

    let schema = Yup.string();

    fieldValidations[input.name] = schema ;
}

const validationSchema = Yup.object( { ...fieldValidations } );

let rows_servicios:IServicios[] = [];

export const SearchServicios = ({ style }: Props) => {

    const { onSetLikeText,...likeTextContext }  = useContext( LikeTextContext );
    const debounceRef = useRef<NodeJS.Timeout>();  

    const [valueServicios, valueServiciosSet] = useState(rows_servicios);
    
    
      const fetchServicios = useCallback(async (): Promise<void> => {
        
          const {  getServicios } = await UseAgendaHoraService() ;
    
          const response = await getServicios();
    
          rows_servicios = [...response];
    
          valueServiciosSet(rows_servicios);
    
      },[valueServiciosSet]);
    
    
      useEffect(() => {
    
        fetchServicios();
      
      }, [valueServiciosSet]);
    
    const handleReset = async () => {
        fetchServicios();
    }

    const handlOnChange = async (textoValue: string) => {
        
        if ( debounceRef.current )
            clearTimeout( debounceRef.current )
    
        debounceRef.current = setTimeout( ()=>{

            fetchLikeText(textoValue)

        }, 350 )
    }

    const fetchLikeText = async (textoValue:string) => {
    
            if(textoValue) {
            
                const {  postLikeServicios } = await UseAgendaHoraService() ;
                    
                const servicios = await postLikeServicios(textoValue) ;
                
                valueServiciosSet(servicios);
            }
        }

    return (
        <Box style={style} >
        <Formik
             initialValues = { initialValues }  
             validationSchema = { validationSchema }  
             onSubmit = { (  ) => { }} 
        >
            {
                () => (
                    <Form>
                    {
                        fromJson.map( ( { type,name,placeholder,label } ) => {

                            if (type == 'text')
                            {
                                return (
                                    <TextInputBaseLike
                                        key={ name }
                                        type= { type }
                                        name={ name } 
                                        label={ label }  
                                        placeholder= { placeholder}   
                                        handleReset = { handleReset }  
                                        title = { 'Servicio' }   
                                        handlOnChange = { handlOnChange } 
                                        value= { likeTextContext.textoValue || ''}                      
                                    />
                                )
                            }
                            throw new Error(`El Type: ${type}, NO es Soportado `)
                        })
                    }
                    </Form>
                )
            }
        </Formik>
        
        <Box
            mt={2}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                
                height: '300px', // Establecer una altura fija (ajustar a lo que necesites)
                overflowY: 'auto', // Habilitar scroll vertical cuando el contenido exceda la altura
            }}
        >  
        <Grid
                container
                spacing={1} // Espaciado entre columnas y filas
                justifyContent="center" // Centrar el contenido horizontalmente
            >
            {
                valueServicios.map((servicio: IServicios) => (

                <Grid
                    item
                    xs={12} // Ocupa toda la fila en pantallas pequeñas
                    key={servicio.id}
                >
                    <Paper
                        key={servicio.id}
                        elevation={3}
                        sx={{
                            width: '90%',
                            borderRadius: 10,
                            overflow: 'hidden', // Evita bordes sobresalientes
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <List component="nav">
                            <ListItemButton 
                                sx={{ 
                                    padding: 2, 
                                    '&:hover': { backgroundColor: 'primary.light' } 
                                }}
                            >
                            <ListItemIcon>
                                <DesignServicesIcon sx={{ color: 'primary.main' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={servicio.nombre}
                                primaryTypographyProps={{
                                variant: 'body1',
                                fontWeight: 'bold',
                                color: 'text.primary',
                                }}
                            />
                            </ListItemButton>
                            
                        </List>
                    </Paper>
                </Grid>
            ))
        }
        </Grid>
        </Box>
    </Box>
    );
  };


