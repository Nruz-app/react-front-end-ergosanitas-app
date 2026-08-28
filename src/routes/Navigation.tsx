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

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
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
    
                        <Box
                            onClick={handleOpenModal}
                            title={'Ingresa Ergosanitas'}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#2196F3', // Azul más vibrante
                                padding: { xs: '12px 16px', sm: '16px 24px' }, // Espaciado adaptado a diferentes tamaños
                                borderRadius: '30px', // Bordes más redondeados
                                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', // Sombra más pronunciada y elegante
                                maxWidth: '400px', // Tamaño más definido
                                color: 'white',
                                textAlign: 'center',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Transiciones suaves
                                margin: '0 auto', // Centra el botón en la pantalla
                                '&:hover': {
                                transform: 'scale(1.05)', // Efecto de hover para aumentar ligeramente el tamaño
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)', // Sombra más profunda al hacer hover
                                },
                            }}
                            >
                            <ManageAccountsIcon
                                className="pointer"
                                sx={{
                                fontSize: { xs: '2rem', sm: '2.5rem' }, // Tamaño del ícono adaptado a diferentes tamaños
                                marginRight: { xs: '8px', sm: '16px' }, // Margen adaptado
                                }}
                            />
                            <Typography
                                sx={{
                                fontWeight: 'bold',
                                fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Texto adaptado a diferentes tamaños
                                letterSpacing: '0.08em',
                                lineHeight: '1.3',
                                }}
                            >
                                Ingresar
                            </Typography>
                        </Box>
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