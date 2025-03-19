import { ErrorMessage, useField } from 'formik';

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { Box } from '@mui/material';
import { ChangeEvent, useState } from 'react';

interface Props {
    label        : string;
    name         : string;
    type?        : string; 
    placeholder? : string;
    handleReset  : () => void; // handleReset  : (e?: React.SyntheticEvent<any>) => void;
       //[x:string]   : any;
    title        : string;
    handlOnChange : (textoValue : string) => void;
    value        : string;   
}


export const TextInputBaseLike = ( { handleReset,handlOnChange, ...props }: Props ) => {


  const [value,setValue] = useState(props.value);  

  const handClear = ( ) => {
    setValue('');
    handleReset()
  }


  const OnChange = (event: ChangeEvent<HTMLInputElement>) => {

    event.preventDefault();
    setValue(event.target.value);
    handlOnChange(event.target.value)

  }


 const [field ] = useField(props);  

  return (
    <Box 
    mt={4} 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2, /* Añade espacio entre los elementos */
    }}
  >
    <Paper
      sx={{ 
        p: '20px 30px', 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: 450, /* Aumenta el tamaño máximo del formulario */
        boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)', /* Sombra más pronunciada */
        borderRadius: '16px', /* Bordes más redondeados */
        backgroundColor: '#ffffff', /* Fondo blanco limpio */
        border: '1px solid #e0e0e0', /* Borde suave para resaltar el formulario */
      }}
    >
      <PersonIcon 
        sx={{ 
          fontSize: 42,  /* Aumenta el tamaño del ícono */
          color: '#1976d2',  
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', 
          borderRadius: '50%',  
          backgroundColor: '#e3f2fd',  
          padding: '10px',  
        }} 
      />
      <InputBase
        sx={{ 
          ml: 2, 
          flex: 1, 
          fontSize: 16, /* Aumenta el tamaño del texto de entrada */
          padding: '8px 12px', /* Añade padding interno */
          backgroundColor: '#f9f9f9', /* Fondo suave para el campo de entrada */
          borderRadius: '8px', /* Bordes redondeados */
        }}
        placeholder="Ingresa tu RUT" /* Añade un placeholder claro */
        inputProps={{ 'aria-label': 'ingresa tu RUT' }}
        {...field}
        {...props}
        value = {value}
        onChange= { OnChange }
      />

      <IconButton 
        type="button" 
        onClick={ handClear }
        sx={{ 
          msScrollLimit:2,
          p: '10px', 
          color: '#ffffff', /* Color del ícono */
          backgroundColor: '#f44336', /* Fondo rojo para destacar el botón de eliminar */
          borderRadius: '50%', /* Forma circular */
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', /* Sombra suave */
          transition: 'background-color 0.3s ease, transform 0.3s ease', /* Transiciones suaves */
          '&:hover': {
            backgroundColor: '#d32f2f', /* Color de fondo en hover */
            transform: 'scale(1.1)', /* Agranda el botón en hover */
          },
        }} 
        aria-label="delete"
        title= {'Eliminar Rut '+props.title }
      >
        <DeleteIcon sx={{ fontSize: 20 }} />  {/* Tamaño del ícono */}
      </IconButton>

      
    </Paper>
  
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        mt: 2, 
      }}
    >
      <ErrorMessage 
        name={props.name} 
        component="span" 
        className="custom-span-error-class"
        
      />
    </Box>    
  </Box>

  )
}
