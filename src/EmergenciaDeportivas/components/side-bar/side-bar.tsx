import React from "react";
import {
  Box,
  Drawer,
  Typography,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

interface SidebarProps {
  filters: any;
  filterOptions: {
    clubes: string[];
    categorias: string[];
    lesiones: string[];
    partesCuerpo: string[];
  };
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => void;
  onResetFilters: () => void;
  open?: boolean;
  headerHeight?: number; // 👈 añadimos esta propiedad opcional
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onResetFilters,
  open = true,
  headerHeight = 64, // 👈 altura del header (ajústala según tu layout)
}) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          backgroundColor: "#f7f9fc",
          padding: 2,
          top: `${headerHeight}px`, // 👈 el espacio debajo de la cabecera
          height: `calc(100% - ${headerHeight}px)`, // 👈 ajusta la altura restante
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      <Box sx={{ overflowY: "auto", height: "100%" }}>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          Ergo SaniTas SpA
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Panel de Control - Liga M-H
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Filtros Dinámicos
        </Typography>

        {/* Rango de fechas */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Rango de Fechas
          </Typography>
          <TextField
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={onFilterChange}
            sx={{ mb: 1 }}
          />
          <TextField
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={onFilterChange}
          />
        </FormControl>

        {/* Club */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Club</InputLabel>
          <Select
            name="club"
            value={filters.club}
            label="Club"
            onChange={onFilterChange}
          >
            <MenuItem value="todos">Todos los clubes</MenuItem>
            {filterOptions.clubes.map((club) => (
              <MenuItem key={club} value={club}>
                {club}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Categoría */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            name="categoria"
            value={filters.categoria}
            label="Categoría"
            onChange={onFilterChange}
          >
            <MenuItem value="todos">Todas las categorías</MenuItem>
            {filterOptions.categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tipo de lesión */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Lesión</InputLabel>
          <Select
            name="lesion"
            value={filters.lesion}
            label="Tipo de Lesión"
            onChange={onFilterChange}
          >
            <MenuItem value="todos">Todos los tipos</MenuItem>
            {filterOptions.lesiones.map((lesion) => (
              <MenuItem key={lesion} value={lesion}>
                {lesion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Parte del cuerpo */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Parte del Cuerpo</InputLabel>
          <Select
            name="cuerpo"
            value={filters.cuerpo}
            label="Parte del Cuerpo"
            onChange={onFilterChange}
          >
            <MenuItem value="todos">Todas las partes</MenuItem>
            {filterOptions.partesCuerpo.map((parte) => (
              <MenuItem key={parte} value={parte}>
                {parte}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={onResetFilters}
          sx={{ mt: 1 }}
        >
          Limpiar Filtros
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
