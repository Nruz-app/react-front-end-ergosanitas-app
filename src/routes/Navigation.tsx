import { //BrowserRouter, 
    BrowserRouter,
    //HashRouter, 
    Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Suspense, useContext, useState } from "react"

import AppBar from '@mui/material/AppBar';
import { Box, Button, Container, MenuItem, Toolbar, Typography } from '@mui/material';

import logoTrans from '../assets/images/logoTransV3.png';


import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';

import LoginIcon from '@mui/icons-material/Login';
import { ModalContext, SubMenuContext } from '../common/context';

import { routes } from './routes';

import { Loading } from './Loading';
import { AppAsistenteVirtualPage } from '../AsistenteVirtual/pages';


export const Navigation = () => {

    const { onOpenModal }  = useContext( ModalContext );
    const { SubMenuActive,active }  = useContext( SubMenuContext );
    
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
        SubMenuActive(true);

        setTimeout(() => {
            setAnchorElNav(null);
            SubMenuActive(false);
        },3000); 
    
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
        SubMenuActive(false);
    };

    const handleOpenModal = () => {
        onOpenModal(true);
        SubMenuActive(false);
    }

    return (
        <Suspense fallback={ <Loading /> }>
        { /* <HashRouter> */ }
        <BrowserRouter>
            <AppBar 
                position="static" 
                sx={{
                    backgroundColor: '#0B2C4D',
                    // El `150%` que había aquí en `xs` hacía que la barra midiera vez y
                    // media el ancho de la pantalla, y era la causa del scroll horizontal
                    // en móvil en todas las páginas. `border-box` es lo que permite que el
                    // `px: 2` quepa dentro del 100% en vez de sumarse a él.
                    width: '100%',
                    boxSizing: 'border-box',
                    px: 2, // padding horizontal
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* El logo medía 100×100 fijos, y en un teléfono de 360 px eso es
                            casi un tercio de la barra. Encoge en `xs` para que el
                            contenido quepa sin necesidad de ensanchar el AppBar. */}
                        <Box
                            component="img"
                            src={logoTrans}
                            alt="Ergo Sanitas"
                            title="Visítanos en ergosanitas.com"
                            sx={{
                                width: { xs: 56, sm: 100 },
                                height: { xs: 56, sm: 100 },
                                flexShrink: 0,
                            }}
                        />
    
    
                        <Box
                            
                            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-controls="menu-home"
                                aria-haspopup="true"
                                color="inherit"
                                onClick={handleOpenNavMenu}     
                            >
                                <MenuIcon />
                            </IconButton>
    
                            <Menu
                                id="menu-home"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted 
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={active}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {routes.map(({ to, name }) => (
                                    <MenuItem key={name} onClick={handleCloseNavMenu}>
                                        <NavLink
                                            to={to}
                                            
                                            className={({ isActive }) => (isActive ? 'nav-active' : '')}
                                            style={({ isActive }) => ({
                                                textDecoration: 'none',
                                                color: isActive ? 'primary.main' : 'inherit',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                fontFamily: 'Blackletter',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                transition: 'color 0.3s ease-in-out, background-color 0.3s ease-in-out',
                                                backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                                            })}
                                        >
                                            {name}
                                        </NavLink>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        <Typography
                            variant="h6"
                            sx={{
                                // En `xs` el texto se reduce en vez de ocultarse: a 1,25rem
                                // con `letterSpacing: .3rem` ocupaba más de 200 px y era lo
                                // que desbordaba la barra en un teléfono. Con letra más
                                // chica, menos espaciado y márgenes estrechos cabe en unos
                                // 60 px, partido en dos líneas como un logotipo.
                                ml: { xs: 1, sm: 2 },
                                mr: { xs: 1, sm: 2 },
                                display: 'flex',
                                fontFamily: 'Blackletter',
                                fontWeight: 700,
                                fontSize: { xs: '0.72rem', sm: '1.25rem' },
                                lineHeight: { xs: 1.1, sm: 1.6 },
                                letterSpacing: { xs: '.06rem', sm: '.3rem' },
                                // En `xs` se permite el salto: «ERGO» sobre «SANITAS» entra
                                // en la mitad del ancho que necesita en una sola línea.
                                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                minWidth: 0,
                                color: 'inherit',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                            }}
                        >
                            Ergo Sanitas
                        </Typography>
    
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {routes.map(({ to, name }) => (
                                <Button
                                    key={name}
                                    sx={{
                                        mx: 1,
                                        borderRadius: 20, // Bordes más redondeados
                                        color: 'white',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fondo más oscuro y elegante
                                        display: 'block',
                                        fontWeight: 'bold',
                                        fontFamily: 'Blackletter',
                                        border: '2px solid transparent', // Borde inicial transparente
                                        padding: '0.5rem 1.0rem', // Relleno para un mejor tamaño del botón
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Cambia el fondo al hacer hover
                                            borderColor: '#ffff', // Borde color primario al hacer hover
                                        },
                                        '&.nav-active': {
                                            color: '#ffff',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo más oscuro si está activo
                                            borderColor: '#ffff', // Borde con color primario si está activo
                                        },
                                    }}
                                >
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) => (isActive ? 'nav-active' : '')}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        {name}
                                    </NavLink>
                                </Button>
                            ))}
                        </Box>
    
                        {/* Mismo lenguaje que el CTA principal del Hero de `home-ergo`
                            (píldora, peso 700, sin mayúsculas forzadas) y el mismo azul:
                            `#1976d2` / `#1565c0` son `azulErgo` y su hover en
                            `home-ergo/config/tema-home.ts`. Se copian como literales para no
                            atar el navegador a un módulo. Es un `Button` real —antes era un
                            `Box` con `onClick`— para que se pueda usar con teclado. */}
                        <Button
                            variant="contained"
                            onClick={handleOpenModal}
                            title="Ingresa a Ergo Sanitas"
                            aria-label="Ingresar a Ergo Sanitas"
                            startIcon={<LoginIcon />}
                            sx={{
                                flexShrink    : 0,
                                // En `xs` la barra deja ~280 px útiles (360 menos el padding
                                // del AppBar y del Container) para logo, menú, «ERGO SANITAS» y
                                // este botón; por eso se compacta ahí y no encima del título.
                                ml            : { xs: 0.5, md: 2 },
                                minHeight     : { xs: 40, sm: 44 },
                                px            : { xs: 1.5, sm: 2.5, md: 3 },
                                py            : { xs: 0.75, sm: 1 },
                                borderRadius  : 999,
                                fontSize      : { xs: '0.8125rem', sm: '0.95rem', md: '1rem' },
                                fontWeight    : 700,
                                letterSpacing : '0.02em',
                                textTransform : 'none',
                                whiteSpace    : 'nowrap',
                                bgcolor       : '#1976d2',
                                boxShadow     : '0 2px 8px rgba(0, 0, 0, 0.25)',
                                transition    : 'background-color 0.2s ease, box-shadow 0.2s ease',
                                '& .MuiButton-startIcon': {
                                    mr: { xs: 0.5, sm: 1 },
                                },
                                '&:hover': {
                                    bgcolor  : '#1565c0',
                                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.45)',
                                },
                                '&:focus-visible': {
                                    outline      : '2px solid #fff',
                                    outlineOffset: 2,
                                },
                                // Bajo 360 px (iPhone SE de primera generación y similares) no
                                // caben logo, menú, «ERGO SANITAS» y el texto del botón: queda
                                // un botón circular solo con el ícono. El nombre accesible lo
                                // sigue dando `aria-label`.
                                '@media (max-width: 359.95px)': {
                                    minWidth : 40,
                                    width    : 40,
                                    height   : 40,
                                    px       : 0,
                                    '& .MuiButton-startIcon': { m: 0 },
                                    '& .texto-ingresar'     : { display: 'none' },
                                },
                            }}
                        >
                            <Box component="span" className="texto-ingresar">
                                Ingresar
                            </Box>
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>
    
            <Routes>
                {routes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path="/*" element={<Navigate to={routes[0].to} replace />} />
                <Route path="/asistente-virtual"element={<AppAsistenteVirtualPage />} />
            </Routes>
            
        </BrowserRouter>
        { /* <BrowserRouter> */ }
    </Suspense>
    
    )

}