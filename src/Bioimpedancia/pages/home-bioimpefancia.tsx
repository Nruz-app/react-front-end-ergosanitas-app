import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { FormBioimpedancia } from "../components/form-bioimpedancia";
import { ListAll } from "../components/list-all";
import { FormExamen } from "../components/form-examen";



export default function HomeBioimpedancia() {

  const [tab, setTab] = useState(0);
  

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 3 }}>
      <Grid item xs={12} md={11} >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Encabezado */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Bioimpedancia
            </Typography>

          </Box>

          {/* Tabs */}
          <Tabs value={tab} onChange={handleChange}>
            <Tab
                icon={<ListAltIcon />}
                iconPosition="start"
                label="Listado"
            />

            <Tab
                icon={<AddCircleOutlineIcon />}
                iconPosition="start"
                label="Crear"
            />
            <Tab
                icon={<AssignmentIcon />}
                iconPosition="start"
                label="Examen"
            />
        </Tabs>

          {/* Contenido */}
          <Box p={3}>
            {tab === 0 && (
              <Box>
                <Typography variant="h6" mb={2}>
                  Listado de Bioimpedancias
                </Typography>

                <ListAll />
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="h6" mb={2}>
                  Crear Bioimpedancia
                </Typography>
                <FormBioimpedancia />
              </Box>
            )}
            {tab === 2 && (
              <Box>
                <Typography variant="h6" mb={2}>
                  Examenes de Bioimpedancia
                </Typography>
                <FormExamen />
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}