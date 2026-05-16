import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip,
  TextField,
  IconButton
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { PagoMedico, PagoDetalle } from "../interface/pago-medicos";
import Swal from "sweetalert2";

type Props = {
  pagoMensual: PagoMedico[];
  onUpdatePrecio: (club: string, valor_cgc: string, periodo: string) => void;   
  onDelete: (club: string, periodo: string) => void;
}

export const ResumenMensual = ({ pagoMensual, onUpdatePrecio,onDelete }: Props) => {
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  const getKey = (item: PagoDetalle) => `${item.club}-${item.periodo}`;

  const handleChange = (item: PagoDetalle, value: number) => {
    setEditValues((prev) => ({
      ...prev,
      [getKey(item)]: value
    }));
  };

  const handleSave = (item: PagoDetalle) => {

    onUpdatePrecio(
        item.club, 
        String(editValues[getKey(item)] ?? item.monto_unitario),
        item.periodo);
    setEditValues((prev) => {
      const newValues = { ...prev };
      delete newValues[getKey(item)];
      return newValues;
    });
    
  }
  const handleDelete = async (item: PagoDetalle) => {

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará ${item.club} (${item.periodo})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await onDelete(item.club, item.periodo);

      Swal.fire({
        title: "Eliminado",
        text: "El registro fue eliminado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  const getStylesByEstado = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return { bg: "#fff5f5", border: "#e53935", chipColor: "error" as const, label: "Pendiente" };
      case "PAGADO":
        return { bg: "#f1f8f4", border: "#43a047", chipColor: "success" as const, label: "Pagado" };
      default:
        return { bg: "#f5f5f5", border: "#9e9e9e", chipColor: "default" as const, label: estado };
    }
  };

  const formatMes = (fecha: string) => {
    const [year, month] = fecha.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {[...pagoMensual]
          .sort((a, b) => b.periodo.localeCompare(a.periodo))
          .map((mes) => {
            const styles = getStylesByEstado(mes.estado);

            return (
              <Grid item xs={12} md={6} lg={4} key={mes.periodo}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: 4,
                    backgroundColor: styles.bg,
                    borderLeft: `6px solid ${styles.border}`,
                    transition: "0.3s",
                    '&:hover': { boxShadow: 8 }
                  }}
                >
                  <CardContent>
                    {/* HEADER */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {formatMes(mes.periodo)}
                      </Typography>
                      <Chip label={styles.label} size="small" color={styles.chipColor} />
                    </Box>

                    {/* RESUMEN */}
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption">MDC</Typography>
                        <Typography fontWeight="bold">${mes.monto_total_mdc.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption">Cant.Pen/Rev </Typography>
                        <Typography fontWeight="bold">{mes.cantidad_total_pen.toLocaleString()}/{mes.cantidad_total_rev.toLocaleString()}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">IVA</Typography>
                        <Typography fontWeight="bold"> ${mes.monto_total_iva.toLocaleString()}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">Descuento</Typography>
                        <Typography fontWeight="bold"> -${mes.descuento_total.toLocaleString()}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">TOTAL</Typography>
                        <Typography fontWeight="bold"> ${mes.monto_total.toLocaleString()}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">CANTIDAD TOTAL</Typography>
                        <Typography fontWeight="bold" fontSize={18}>
                          {mes.cantidad_total_ecg.toLocaleString()}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">TOTAL FINAL </Typography>
                        <Typography fontWeight="bold" fontSize={18}>
                          ${mes.monto_total_final.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* DETALLE */}
                    <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                      {mes.data.map((item, idx) => {
                        const key = getKey(item);
                        const value = editValues[key] ?? item.monto_unitario;

                        return (
                          <Box
                            key={idx}
                            display="flex"
                            flexDirection="column"
                            mb={1}
                            p={1.5}
                            sx={{
                              borderRadius: 2,
                              backgroundColor: "#ffffffaa",
                              backdropFilter: "blur(4px)",
                              boxShadow: 1
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  { item.club.split("@")[0] }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cant ECG: {item.cantidad_ecg}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cant Pen/Rev: {item.cantidad_mdc_pen}/{item.cantidad_mdc_rev}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1}>
                                <TextField
                                  size="small"
                                  type="number"
                                  label="Unitario"
                                  value={value}
                                  onChange={(e) => handleChange(item, Number(e.target.value))}
                                  sx={{ width: 100 }}
                                />

                                {/* GUARDAR */}
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleSave(item)}
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>

                                {/* ELIMINAR 👇 */}
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(item)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            {/* DETALLE EXTRA */}
                            <Box
                              mt={1}
                              display="grid"
                              gridTemplateColumns="repeat(5, 1fr)"
                              gap={1}
                            >
                              <Box>
                                <Typography variant="caption" color="text.secondary">IVA </Typography>
                                <Typography variant="caption" fontWeight={600}>
                                  ${item.monto_iva.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">MDC </Typography>
                                <Typography variant="caption" fontWeight={600}>
                                  ${item.monto_mdc_pen.toLocaleString()+item.monto_mdc_rev.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">Unitario </Typography>
                                <Typography variant="caption" fontWeight={600}>
                                  ${value.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">ECG </Typography>
                                <Typography variant="caption" fontWeight={600}>
                                  ${item.monto_ecg.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">Desc. </Typography>
                                <Typography variant="caption" fontWeight={600}>
                                  -${item.descuento.toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
}