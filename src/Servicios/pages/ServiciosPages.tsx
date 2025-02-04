import { useCallback, useEffect, useState } from "react";
import { UseAgendaHoraService } from "../../AgendarHora/services/useAgendaHoraService";
import { IServicios } from "../../AgendarHora/interface";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

let rows_servicios:IServicios[] = [];

import logoTrans from '../../assets/images/logoTrans.png';

export const ServiciosPage = () => {


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



  return (
    <Box
      ml={15}
      mt={8}
      sx={{
        width: { xs: '90%', sm: '70%', md: '60%' },
        margin: '0 auto',
        mt: 8,
        flexGrow: 1,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontFamily: 'cursive',
          fontWeight: 'bold',
          letterSpacing: '0.1rem',
          textTransform: 'uppercase',
          color: 'primary.main',
          mb: 4,
          mt: 6,
          animation: 'backInUp 1s ease-out',
        }}
      >
        Servicios y Valores
      </Typography>

      
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        flexDirection="column" 
        textAlign="center" 
        p={{ xs: 2, sm: 3, md: 4 }} // Padding adaptable según el tamaño de la pantalla
        borderRadius={2} 
        boxShadow="0px 6px 16px rgba(0, 0, 0, 0.1)"
        sx={{
          maxWidth: { xs: '90%', sm: '80%', md: '700px', lg: '800px' }, // Ajuste del ancho según el tamaño de la pantalla
          minHeight: { xs: 'auto', md: '100px' }, // Altura mínima, solo para pantallas más grandes
          mx: "auto",
          bgcolor: "#f9f9f9",
        }}
      >
        <img 
          src={logoTrans} 
          alt="logo" 
          style={{
            borderRadius: '50%',
            width: '5rem', // Tamaño más pequeño en pantallas chicas
            height: '5rem',
            marginBottom: '1rem',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease',
            border: '3px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0px 12px 30px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.border = '3px solid #4CAF50';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0px 8px 20px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.border = '3px solid transparent';
          }}
        />
        <Typography 
          variant="h6" 
          color="textPrimary" 
          fontWeight="500" 
          gutterBottom
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} // Tipografía ajustable
        >
          Información importante:
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary" 
          paragraph
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} // Tamaño de texto responsive
        >
          Los precios de nuestros exámenes pueden estar sujetos a descuentos especiales si es parte de nuestra <strong>Alianza Médica</strong>. 
          Asegúrese de consultar con nuestro equipo para obtener el mejor beneficio.
        </Typography>
      </Box>
    
    {
      valueServicios.map((servicio: IServicios, index: number) => (
        <Accordion
          key={servicio.id}
          defaultExpanded={index === 0}
          sx={{
            mb: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 3,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 6px 30px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
            aria-controls={`panel${servicio.id}-content`}
            id={`panel${servicio.id}-header`}
            sx={{
              background: 'linear-gradient(90deg, #1976D2, #2196F3)',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(90deg, #1565C0, #1976D2)',
              },
              transition: 'background 0.3s ease-in-out',
            }}
          >
            <Typography variant="h5" color="#fff" fontWeight="bold">
              {
                servicio.nombre
              } - $
              {
                (servicio.precio / 1000).toLocaleString('es-ES', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })
              }
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: '#f5f5f5',
              p: 3,
              borderRadius: 2,
              border: '1px solid #ddd',
              animation: 'fadeIn 0.5s ease',
            }}
          >
            <Typography variant="h6" color="#2196F3" mb={2}>
              {servicio.descripcion}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))
    }
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        p: 4,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        mx: 'auto',
        mt: 6,
      }}
    >
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          * Servicios no incluyen Insumos Clínicos
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Los valores proporcionados son exclusivamente aplicables a las comunas
          ubicadas en el sector sur de la Región Metropolitana, y no debe ser
          extrapolado a otras zonas geográficas.
        </Typography>
      </Box>
    </Box>
  </Box>
  )
}
