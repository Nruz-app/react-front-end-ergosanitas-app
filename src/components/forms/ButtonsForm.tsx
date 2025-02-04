import SaveAsIcon from '@mui/icons-material/SaveAs';
import { Button } from '@mui/material';

interface Props {
  onSubmit : () => void;
  title : string;
}

export const ButtonsForm = ( { title,onSubmit } :  Props ) => {
  return (
    <Button
        onClick={ onSubmit }
        variant="contained"
        startIcon={<SaveAsIcon />}
        size="large"
        sx={{
            backgroundColor: '#007bff', // Azul elegante
            color: '#FFFFFF',
            borderRadius: '12px', // Bordes más redondeados
            padding: '12px 24px', // Más espacio alrededor del texto
            textTransform: 'none', // Evita que el texto se convierta a mayúsculas
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)', // Sombra más pronunciada
            fontWeight: 'bold', // Texto en negrita
            fontSize: '16px', // Tamaño de fuente ligeramente mayor
            transition: 'all 0.3s ease', // Transiciones suaves
            '&:hover': {
            backgroundColor: '#0056b3', // Color más oscuro al hacer hover
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', // Sombra más pronunciada al hacer hover
            },
            '&:active': {
            backgroundColor: '#004080', // Color más oscuro al hacer clic
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Sombra suave al hacer clic
            },
        }}
    >
        { title }
    </Button>
  )
}
