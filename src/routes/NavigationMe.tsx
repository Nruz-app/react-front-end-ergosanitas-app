import { //BrowserRouter, 
    HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Suspense, useContext, useState } from "react"

import AppBar from '@mui/material/AppBar';
import { Box, Button, Container, MenuItem, Toolbar, Typography } from '@mui/material';

import logoTrans from '../assets/images/logoTransV3.png';


import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';


//link => https://materialui.co/icons
import PersonOffIcon from '@mui/icons-material/PersonOff';


import { LoginContext, SubMenuContext } from '../common/context';

import { routesDe } from './routesDE';
import { Loading } from './Loading';

export const NavigationMe = () => {

    
    const { ValidLogin,user }  = useContext( LoginContext );
    
    const { user_perfil,user_logo }  = user;

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

    const handleCloseLogin = () => {

        ValidLogin (false,{
            user_id        : 0,
            user_email     : '',
            user_name      : '',
            user_perfil    : ''
        }); 
    }

    return (
    <Suspense fallback = { <Loading /> } >
        { /* <BrowserRouter> */ }
        <HashRouter>
            <AppBar 
                sx={{
                    width: { xs: '150%', sm: '100%' },
                    px: 2, // padding horizontal
                }}
                position="static" 
                color='success'>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <img 
                            width={ 100 }
                            height={ 100 }
                            src= { logoTrans } 
                            title='Visitanos en ergosanitas.com' />   

                        <Box 
                            sx={ { flexGrow: 1, display: { xs: 'flex', md: 'none' } } } >
                            <IconButton
                                size="large"
                                aria-controls="menu-ergo"
                                aria-haspopup="true"
                                color="inherit"
                                onClick={ handleOpenNavMenu }
                            >{active}
                            <MenuIcon />
                            </IconButton>

                            <Menu 
                                id="menu-ergo"
                                anchorEl={ anchorElNav }
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                                open={ active }
                                onClose={ handleCloseNavMenu }
                                sx={{
                                  display: { xs: 'block', md: 'none' },
                                }}
                            >
                            {
                                // Filtra solo los que tienen status: true
                                routesDe.filter(({ status }) => status) 
                                .map(({ to, name, perfil }) => (
                                    <MenuItem key={ name } >
                                        {
                                            (user_perfil == perfil) ? (

                                                <NavLink 
                                                    to={to} 
                                                    className={({ isActive }) => isActive ? 'nav-active' : ''}
                                                    style={({ isActive }) => ({
                                                        textDecoration: 'none',
                                                        color: isActive ? 'primary' : 'inherit', 
                                                        fontWeight: isActive ? 'lighter' : 'normal', 
                                                        fontFamily: 'Blackletter',
                                                        padding: '0.5rem 1rem', 
                                                        borderRadius: '4px', 
                                                        transition: 'color 0.3s ease-in-out, background-color 0.3s ease-in-out', 
                                                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent', 
                                                    })}
                                                >
                                                    { name } 
                                                </NavLink>
                                            )
                                            : (
                                                (user_perfil == "Administrador") && (
                                                    <NavLink 
                                                        to={to} 
                                                        className={({ isActive }) => isActive ? 'nav-active' : ''}
                                                        style={({ isActive }) => ({
                                                            textDecoration: 'none',
                                                            color: isActive ? 'primary' : 'inherit', 
                                                            fontWeight: isActive ? 'lighter' : 'normal', 
                                                            fontFamily: 'Blackletter',
                                                            padding: '0.5rem 1rem', 
                                                            borderRadius: '4px', 
                                                            transition: 'color 0.3s ease-in-out, background-color 0.3s ease-in-out', 
                                                            backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent', 
                                                        })}
                                                    >
                                                        { name } 
                                                    </NavLink>
                                                )
                                            )
                                        }
                                        
                                    </MenuItem>

                                ))
                            }    
                            </Menu>
                        </Box> 

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

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {
                           // Filtra solo los que tienen status: true  
                           routesDe.filter(({ status }) => status) 
                           .map(({ to, name, perfil }) => (
           
                                (user_perfil == perfil) ? (
                                    <Button
                                        key={ name }
                                        sx={{
                                            mx: 1,
                                            borderRadius: 5,
                                            color: 'white',
                                            fontFamily: 'Blackletter',
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo semitransparente
                                            display: 'block',
                                            fontWeight: 'bold',
                                            border: '2px solid white', // Borde visible alrededor del botón
                                            padding: '0.5rem 1.5rem', // Relleno para un mejor tamaño del botón
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)', // Cambia el fondo al hacer hover
                                                borderColor: 'primary.success', // Cambia el color del borde al hacer hover
                                            },
                                            '&.nav-active': {
                                                color: 'primary.success',
                                                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo más oscuro si está activo
                                                borderColor: 'primary.success', // Borde con color primario si está activo
                                            }
                                        }}
                                    >
                                    <NavLink
                                            to={to}
                                            className={({ isActive }) => isActive ? 'nav-active' : ''}
                                            style={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                            }}
                                        >
                                            {name}
                                        </NavLink>
                                    </Button>

                                )
                                : (
                                    (user_perfil == "Administrador") && (

                                        <Button
                                            key={ name }
                                            sx={{
                                                mx: 1,
                                                borderRadius: 5,
                                                color: 'white',
                                                fontFamily: 'Blackletter',
                                                backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo semitransparente
                                                display: 'block',
                                                fontWeight: 'bold',
                                                border: '2px solid white', // Borde visible alrededor del botón
                                                padding: '0.5rem 1.5rem', // Relleno para un mejor tamaño del botón
                                                transition: 'all 0.3s ease-in-out',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Cambia el fondo al hacer hover
                                                    borderColor: '#ffff ', // Cambia el color del borde al hacer hover
                                                },
                                                '&.nav-active': {
                                                    color: '#ffff',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo más oscuro si está activo
                                                    borderColor: '#ffff', // Borde con color primario si está activo
                                                }
                                            }}
                                        >
                                        <NavLink
                                                to={to}
                                                className={({ isActive }) => isActive ? 'nav-active' : ''}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                }}
                                            >
                                                {name}
                                            </NavLink>
                                        </Button>
                                    
                                    )
                                )
                            ))    
                        }
                        </Box>
                        <Box
                            onClick={handleCloseLogin}
                            title="Cerrar sesión"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: { xs: 1.5, sm: 2 },
                                py: { xs: 1, sm: 1.2 },
                                borderRadius: "50px",
                                background: "linear-gradient(135deg, #66BB6A, #43A047)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                "&:hover": {
                                transform: "translateY(-2px) scale(1.03)",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                                },
                            }}
                            >
                            {/* AVATAR / ICONO */}
                            <Box
                                sx={{
                                width: { xs: 36, sm: 42 },
                                height: { xs: 36, sm: 42 },
                                borderRadius: "50%",
                                overflow: "hidden",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                }}
                            >
                                {user_logo ? (
                                <img
                                    src={user_logo}
                                    alt="user"
                                    style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    }}
                                />
                                ) : (
                                <PersonOffIcon
                                    sx={{
                                    color: "white",
                                    fontSize: { xs: "1.5rem", sm: "1.8rem" },
                                    }}
                                />
                                )}
                            </Box>

                            {/* NOMBRE */}
                            <Typography
                                sx={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                                whiteSpace: "nowrap",
                                }}
                            >
                                {user.user_name}
                            </Typography>
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>

            <Routes>
             {
                routesDe.map( ({ path, Component  }) => (
                    <Route 
                        key={ path }
                        path={ path }
                        element={ <Component /> } 
                    />
                ))
             }  
                <Route path='/*' element={ <Navigate to ={ routesDe[0].to }  replace /> } />   
            </Routes>            


        </HashRouter>
        { /* <BrowserRouter> */ }
    </Suspense>
    )

}