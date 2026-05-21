import {
  HashRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import { Suspense, useContext, useState } from "react";

import AppBar from "@mui/material/AppBar";
import {
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import logoTrans from "../assets/images/logoTransV3.png";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

//link => https://materialui.co/icons
import PersonOffIcon from "@mui/icons-material/PersonOff";

import { LoginContext, SubMenuContext } from "../common/context";

import { routesErgo } from "./routesErgo";
import { Loading } from "./Loading";

export const NavigationErgo = () => {
  const { ValidLogin, user } = useContext(LoginContext);

  const { user_perfil, user_logo } = user;

  const { SubMenuActive, active } = useContext(SubMenuContext);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorElNav(event.currentTarget);
    SubMenuActive(true);

    setTimeout(() => {
      setAnchorElNav(null);
      SubMenuActive(false);
    }, 3000);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    SubMenuActive(false);
  };

  const handleCloseLogin = () => {
    ValidLogin(false, {
      user_id: 0,
      user_email: "",
      user_name: "",
      user_perfil: "",
    });
  };

  const validatePerfil = (perfil: string) => {
    return (
      user_perfil === perfil ||
      user_perfil === "Administrador" ||
      perfil === "All"
    );
  };

  return (
    <Suspense fallback={<Loading />}>
      <HashRouter>
        <AppBar
          sx={{
            width: { xs: "150%", sm: "100%" },
            px: 2,
          }}
          position="static"
          color="success"
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              {/* LOGO */}
              <img
                width={100}
                height={100}
                src={logoTrans}
                title="Visitanos en ergosanitas.com"
              />

              {/* MOBILE MENU */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: "flex", md: "none" },
                }}
              >
                <IconButton
                  size="large"
                  aria-controls="menu-ergo"
                  aria-haspopup="true"
                  color="inherit"
                  onClick={handleOpenNavMenu}
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  id="menu-ergo"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={active}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {routesErgo
                    .filter(({ status }) => status)
                    .map((route) => {
                      if (!validatePerfil(route.perfil)) return null;

                      // MENU CON CHILDREN
                      if (
                        route.children &&
                        route.children.length > 0
                      ) {
                        return route.children.map((child) => (
                          <MenuItem
                            key={`${route.name}-${child.name}`}
                            onClick={handleCloseNavMenu}
                          >
                            <NavLink
                              to={`${route.to}/${child.to}`}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                                width: "100%",
                              }}
                            >
                              {route.name} - {child.name}
                            </NavLink>
                          </MenuItem>
                        ));
                      }

                      // MENU NORMAL
                      return (
                        <MenuItem
                          key={route.name}
                          onClick={handleCloseNavMenu}
                        >
                          <NavLink
                            to={route.to}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                              width: "100%",
                            }}
                          >
                            {route.name}
                          </NavLink>
                        </MenuItem>
                      );
                    })}
                </Menu>
              </Box>

              {/* TITULO */}
              <Typography
                variant="h6"
                sx={{
                  ml: 2,
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "Blackletter",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                Ergo Sanitas
              </Typography>

              {/* DESKTOP MENU */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: "none", md: "flex" },
                }}
              >
                {routesErgo
                  .filter(({ status }) => status)
                  .map((route) => {
                    if (!validatePerfil(route.perfil)) return null;

                    // MENU CON CHILDREN
                    if (
                      route.children &&
                      route.children.length > 0
                    ) {
                      return (
                        <Box
                          key={route.name}
                          sx={{
                            position: "relative",

                            "&:hover .submenu-ergo": {
                              display: "flex",
                            },
                          }}
                        >
                          <Button
                            sx={{
                              mx: 1,
                              borderRadius: 5,
                              color: "white",
                              fontFamily: "Blackletter",
                              backgroundColor:
                                "rgba(0, 0, 0, 0.2)",
                              display: "block",
                              fontWeight: "bold",
                              border: "2px solid white",
                              padding: "0.5rem 1.5rem",
                            }}
                          >
                            {route.name}
                          </Button>

                          {/* SUBMENU */}
                          <Box
                            className="submenu-ergo"
                            sx={{
                              display: "none",
                              flexDirection: "column",
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              minWidth: 240,
                              backgroundColor: "white",
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: 5,
                              zIndex: 9999,
                            }}
                          >
                            {route.children.map((child) => (
                              <NavLink
                                key={child.name}
                                to={`${route.to}/${child.to}`}
                                style={{
                                  textDecoration: "none",
                                  color: "#424242",
                                  padding: "14px 18px",
                                  transition: "0.2s",
                                }}
                              >
                                {child.name}
                              </NavLink>
                            ))}
                          </Box>
                        </Box>
                      );
                    }

                    // MENU NORMAL
                    return (
                      <Button
                        key={route.name}
                        sx={{
                          mx: 1,
                          borderRadius: 5,
                          color: "white",
                          fontFamily: "Blackletter",
                          backgroundColor:
                            "rgba(0, 0, 0, 0.2)",
                          display: "block",
                          fontWeight: "bold",
                          border: "2px solid white",
                          padding: "0.5rem 1.5rem",
                          transition: "all 0.3s ease-in-out",

                          "&:hover": {
                            backgroundColor:
                              "rgba(255,255,255,0.2)",
                          },
                        }}
                      >
                        <NavLink
                          to={route.to}
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          {route.name}
                        </NavLink>
                      </Button>
                    );
                  })}
              </Box>

              {/* USER */}
              <Box
                onClick={handleCloseLogin}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1, sm: 1.2 },
                  borderRadius: "50px",
                  background:
                    "linear-gradient(135deg, #66BB6A, #43A047)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",

                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  },

                  "&:hover .avatar-img": {
                    transform: "scale(1.12)",
                  },
                }}
              >
                {/* AVATAR */}
                <Box
                  sx={{
                    width: { xs: 36, sm: 42 },
                    height: { xs: 36, sm: 42 },
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor:
                      "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {user_logo ? (
                    <img
                      src={user_logo}
                      alt="user"
                      className="avatar-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.25s ease",
                      }}
                    />
                  ) : (
                    <PersonOffIcon
                      sx={{
                        color: "white",
                        fontSize: {
                          xs: "1.5rem",
                          sm: "1.8rem",
                        },
                      }}
                    />
                  )}
                </Box>

                {/* TEXTO */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    lineHeight: 1.1,
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.05rem",
                      },
                    }}
                  >
                    {user.user_name}
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.7rem",
                      fontWeight: 400,
                      letterSpacing: "0.4px",
                    }}
                  >
                    {user.user_perfil}
                  </Typography>
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* RUTAS */}
        <Routes>
          {routesErgo.map(
            ({ path, Component, children }) => {
              const ParentComponent = Component;

              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    ParentComponent ? (
                      <ParentComponent />
                    ) : (
                      <Outlet />
                    )
                  }
                >
                  {children?.map((child) => {
                    const ChildComponent =
                      child.Component;

                    return (
                      <Route
                        key={child.to}
                        path={child.path}
                        element={<ChildComponent />}
                      />
                    );
                  })}
                </Route>
              );
            }
          )}

          <Route
            path="/*"
            element={
              <Navigate
                to={routesErgo[0].to}
                replace
              />
            }
          />
        </Routes>
      </HashRouter>
    </Suspense>
  );
}