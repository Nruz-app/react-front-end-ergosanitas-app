import { Box, Typography } from "@mui/material"
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; 
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';

import IconTikTok from '../../assets/images/iconTiktok.png';
import logoTrans from '../../assets/images/logoTrans.png';

interface Props {
    type : string
}


export const MarqueeBox = ( { type } : Props ) => {



    if( type === 'ergoSanitasApp' ) {

        return (
            <Box
                sx={{
                    ml: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f1f3', // Fondo sutil para el Box
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra para dar profundidad
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)', // Sombra más profunda al hacer hover
                    },
                }}
            >
                <img 
                    src={ logoTrans } 
                    alt="TikTok Logo" 
                    style={{ 
                        fontSize: '2.0rem', 
                        padding: '1rem', // Aumentar ligeramente el padding para destacar más la imagen
                        borderRadius: '50%', // Hacer la imagen circular
                        width: '3rem', // Ajustar el tamaño de la imagen (ancho y alto)
                        height: '3rem',
                        marginRight: '1.5rem', // Aumentar el margen para mayor espaciado
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Añadir sombra para un efecto 3D sutil
                        transition: 'transform 0.3s ease', // Añadir una transición suave
                    }}
                    className="tiktok-logo" // Añadir clase para manejo de eventos como hover
                />
                
                
                <Typography
                    component="a"
                    href="https://ergosanitas.com/"
                    target="_blank"
                    sx={{
                       
                        textDecoration: 'none', // Sin subrayado en el enlace
                        color: '#2a9d8f', // Color de texto verde aqua
                        fontWeight: 'bold',
                        fontSize: '1rem', // Tamaño de fuente más grande
                        letterSpacing: '0.1em', // Espaciado entre letras
                        '&:hover': {
                            color: '#e76f51', // Cambio de color al pasar el mouse
                            textDecoration: 'underline', // Subrayado al hacer hover
                        },
                    }}
                >
                    Siguenos en Nuestros <br /> Redes Sociales  
                </Typography>

            </Box>
        )


    }
    else if( type === 'WhatsApp' ) {

        return (
            <Box
                sx={{
                    ml: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f1f3', // Fondo sutil para el Box
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra para dar profundidad
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)', // Sombra más profunda al hacer hover
                    },
                }}
            >
                <WhatsAppIcon
                    fontSize="large"
                    sx={{
                        backgroundColor: '#25D366', // Color de fondo verde de WhatsApp
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '50%', // Hacer el ícono circular
                        marginRight: '1rem',
                        fontSize: '2.5rem', 
                    }}
                    className="tiktok-logo" 
                />
                <Typography
                    component="a"
                   href="https://wa.me/+56961149975"
                    target="_blank"
                    sx={{
                       
                        textDecoration: 'none', // Sin subrayado en el enlace
                        color: '#2a9d8f', // Color de texto verde aqua
                        fontWeight: 'bold',
                        fontSize: '1rem', // Tamaño de fuente más grande
                        letterSpacing: '0.1em', // Espaciado entre letras
                        '&:hover': {
                            color: '#e76f51', // Cambio de color al pasar el mouse
                            textDecoration: 'underline', // Subrayado al hacer hover
                        },
                    }}
                >
                    WhatsApp: <br /> +56 9 6114 9975 
                </Typography>

            </Box>

        )
    }    
    else if( type === 'FaceBookApp' ) {

        return (
            <Box
                sx={{
                    ml: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f1f3', // Fondo sutil para el Box
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra para dar profundidad
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)', // Sombra más profunda al hacer hover
                    },
                }}
            >
                <FacebookOutlinedIcon
                    fontSize="large"
                    sx={{
                        backgroundColor: '#2471a3', // Color de fondo azul de Facebook
                        color: 'white',
                        padding: '0.75rem', // Aumentar ligeramente el padding para un aspecto más equilibrado
                        borderRadius: '50%', // Ícono circular
                        fontSize: '2.5rem', // Aumentar el tamaño del ícono para mayor presencia
                        marginRight: '1.5rem', // Aumentar el margen para mayor espaciado
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Añadir sombra para un efecto 3D sutil
                        transition: 'transform 0.3s ease', // Añadir una transición suave
                        '&:hover': {
                            transform: 'scale(1.1)', // Efecto de escala al pasar el cursor
                        },
                    }}
                />

                <Typography
                    component="a"
                    href="https://www.facebook.com/people/Ergo-SaniTas/pfbid0kRMrwaPtSiWoCAcbXTm9Ho6rGmVyTGVWUwnByySwdKwQQ6KDkffNPwjhzb5MCRJYl/"
                    target="_blank"
                    sx={{
                       
                        textDecoration: 'none', // Sin subrayado en el enlace
                        color: '#2a9d8f', // Color de texto verde aqua
                        fontWeight: 'bold',
                        fontSize: '1rem', // Tamaño de fuente más grande
                        letterSpacing: '0.1em', // Espaciado entre letras
                        '&:hover': {
                            color: '#e76f51', // Cambio de color al pasar el mouse
                            textDecoration: 'underline', // Subrayado al hacer hover
                        },
                    }}
                >
                    FaceBook: <br /> Ergo Sanitas Spa
                </Typography>

            </Box>
        )

    }
    else if( type === 'TiktokApp' ) {

        return (
            <Box
                sx={{
                    ml: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f1f3', // Fondo sutil para el Box
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra para dar profundidad
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)', // Sombra más profunda al hacer hover
                    },
                }}
            >
                <img 
                    src={IconTikTok} 
                    alt="TikTok Logo" 
                    style={{ 
                        fontSize: '2.0rem', 
                        padding: '1rem', // Aumentar ligeramente el padding para destacar más la imagen
                        borderRadius: '50%', // Hacer la imagen circular
                        width: '3rem', // Ajustar el tamaño de la imagen (ancho y alto)
                        height: '3rem',
                        marginRight: '1.5rem', // Aumentar el margen para mayor espaciado
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Añadir sombra para un efecto 3D sutil
                        transition: 'transform 0.3s ease', // Añadir una transición suave
                    }}
                    className="tiktok-logo" // Añadir clase para manejo de eventos como hover
                />

                <Typography
                    component="a"
                    href='https://www.tiktok.com/@ergosanitas?_t=8ZVA6oHw4Un&_r=1'
                    target="_blank"
                    sx={{
                       
                        textDecoration: 'none', // Sin subrayado en el enlace
                        color: '#2a9d8f', // Color de texto verde aqua
                        fontWeight: 'bold',
                        fontSize: '1rem', // Tamaño de fuente más grande
                        letterSpacing: '0.1em', // Espaciado entre letras
                        '&:hover': {
                            color: '#e76f51', // Cambio de color al pasar el mouse
                            textDecoration: 'underline', // Subrayado al hacer hover
                        },
                    }}
                >
                    Tik Tok: <br /> Ergo Sanitas
                </Typography>

            </Box>
        )

    }
    
  }