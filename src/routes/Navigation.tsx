import { //BrowserRouter, 
    HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
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


export const Navigation = () => {

    const { onOpenModal }  = useContext( ModalContext );
    const { SubMenuActive,active }  = useContext( SubMenuContext );
    
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
        SubMenuActive(true);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
        SubMenuActive(false);
    };

    const handleOpenModal = () => {
        onOpenModal(true);
    }

    return (
        <Suspense fallback={ <Loading /> }>
        { /* <BrowserRouter> */ }
        <HashRouter>
            <AppBar position="static" color="primary">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <img
                            width={100}
                            height={100}
                            src={logoTrans}
                            title="Visítanos en ergosanitas.com"
                        />
    
                        <Typography
                            variant="h6"
                            sx={{
                                ml: 2,
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'Blackletter',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                            }}
                        >
                            Ergo Sanitas
                        </Typography>
    
                        <Box
                            
                            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                                onClick={handleOpenNavMenu}     
                            >
                                <MenuIcon />
                            </IconButton>
    
                            <Menu
                                id="menu-appbar"
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
                                            borderColor: 'primary.main', // Borde color primario al hacer hover
                                        },
                                        '&.nav-active': {
                                            color: 'primary.main',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo más oscuro si está activo
                                            borderColor: 'primary.main', // Borde con color primario si está activo
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
            </Routes>
        </HashRouter>
        { /* <BrowserRouter> */ }
    </Suspense>
    
    )

}