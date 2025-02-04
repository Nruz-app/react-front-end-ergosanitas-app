//import { Box, Drawer, Theme, Typography, useMediaQuery } from "@mui/material";
import { Box, Drawer,  Typography } from "@mui/material";

import { IconChevronLeft } from "@tabler/icons-react";
//import { useState } from "react";

export default function Filters({
  children,
  openFilters,
  toggleFilters,
}: {
  children?: JSX.Element;
  openFilters: boolean;
  toggleFilters: (open: boolean) => void;
}): JSX.Element {
  
  /*
    ERROR EN theme?.breakpoints?.up("lg") POR ESO NO SE PUDO USAR ESTA TABLE
  const [open, setOpen] = useState(true);
  const lgUp = useMediaQuery((theme: Theme) => theme?.breakpoints?.up("lg"));

  const toggleDrawer = (newOpen: boolean) => () => {
      console.log(open);
      setOpen(newOpen);
  };
  */
  const lgUp =1;

  if (lgUp) {
    return (
      <Box
        sx={{
          width: "240px",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: "240px",
            boxSizing: "border-box",
          },
          transition: "width 225ms cubic-bezier(0, 0, 0.2, 1)",
          marginRight: "1rem",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          ...(!openFilters && {
            transition: "width 225ms cubic-bezier(0, 0, 0.2, 1)",
            width: "0",
            marginRight: "0",
            overflowX: "hidden",
            "& .MuiDrawer-paper": {
              width: "0",
            },
            borderRight: "none",
          }),
        }}
      >
        <Box
          sx={{
            height: "100%",
            paddingTop: "1rem",
            paddingRight: "2rem",
          }}
        >
          <Box pb={3}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Box>
                <IconChevronLeft
                  onClick={() => toggleFilters(false)}
                  style={{
                    cursor: "pointer",
                    color: "rgba(0, 0, 0, 0.54)",
                  }}
                  stroke={1.5}
                />
              </Box>
            </Box>
          </Box>
          <Box>{children}</Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Drawer
        open={openFilters}
        onClose={() => toggleFilters(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
        variant="temporary"
        anchor="left"
      >
        <Box
          sx={{
            height: "100%",
            padding: "1rem",
          }}
        >
          <Box pb={3}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
          </Box>
          <Box>{children}</Box>
        </Box>
      </Drawer>
    </>
  );
}
