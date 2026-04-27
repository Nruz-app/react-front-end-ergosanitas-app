import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip
} from "@mui/material";
import { PagoMedico } from "../interface/pago-medicos";

type Props = {
  data: PagoMedico[];
};

export const ResumenMensual = ({ data }: Props) => {

  const getStylesByEstado = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return {
          bg: "#fff5f5",
          border: "#e53935",
          chipColor: "error" as const,
          label: "Pendiente"
        };
      case "PAGADO":
        return {
          bg: "#f1f8f4",
          border: "#43a047",
          chipColor: "success" as const,
          label: "Pagado"
        };
      default:
        return {
          bg: "#f5f5f5",
          border: "#9e9e9e",
          chipColor: "default" as const,
          label: estado
        };
    }
  };

  const formatMes = (fecha: string) => {
    const [year, month] = fecha.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long"
    });
  };

  const getClubColor = (index: number) => {
    const colors = ["#e3f2fd", "#f3e5f5", "#e8f5e9", "#fff3e0", "#fce4ec"];
    return colors[index % colors.length];
  };

  return (
    <Box p={2}>
      <Grid container spacing={2}>

        {[...data]
          .sort((a, b) => b.fecha.localeCompare(a.fecha))
          .map((mes) => {

            const styles = getStylesByEstado(mes.estado);

            return (
              <Grid item xs={12} sm={6} md={4} key={mes.fecha}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: 3,
                    height: "100%",
                    backgroundColor: styles.bg,
                    borderLeft: `6px solid ${styles.border}`,
                  }}
                >
                  <CardContent>

                    {/* HEADER */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {formatMes(mes.fecha)}
                      </Typography>

                      <Chip
                        label={styles.label}
                        size="small"
                        color={styles.chipColor}
                      />
                    </Box>

                    {/* KPI RESUMEN */}
                    <Grid container spacing={1} mt={1}>
                      
                      <Grid item xs={6}>
                        <Typography variant="caption">Cant. MD</Typography>
                        <Typography fontWeight="bold">
                          {mes.data.reduce((a, b) => a + (b.cantidad_md || 0), 0)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">Monto MD</Typography>
                        <Typography fontWeight="bold">
                          ${mes.monto_md.toLocaleString()}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">IVA</Typography>
                        <Typography fontWeight="bold">
                          ${mes.monto_iva.toLocaleString()}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption">Cant. Total</Typography>
                        <Typography fontWeight="bold">
                          {mes.data.reduce((a, b) => a + (b.cantidad_total || 0), 0)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption">Monto Total</Typography>
                        <Typography fontWeight="bold" fontSize={18}>
                          ${mes.monto_total.toLocaleString()}
                        </Typography>
                      </Grid>

                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    {/* HEADER TABLA */}
                    <Box
                      display="grid"
                      gridTemplateColumns="1.4fr 0.8fr 1fr 0.8fr 0.8fr 1fr"
                      gap={1}
                      mb={1}
                    >
                      <Typography variant="caption" fontWeight="bold">Club</Typography>
                      <Typography variant="caption" fontWeight="bold">Cant MD</Typography>
                      <Typography variant="caption" fontWeight="bold">Monto MD</Typography>
                      <Typography variant="caption" fontWeight="bold">Cant T</Typography>
                      <Typography variant="caption" fontWeight="bold">Total</Typography>
                      <Typography variant="caption" fontWeight="bold">IVA</Typography>
                    </Box>

                    {/* DETALLE CON SCROLL */}
                    <Box
                      sx={{
                        maxHeight: 180,
                        overflowY: "auto",
                        pr: 1,
                      }}
                    >
                      {mes.data.map((item, idx) => (
                        <Box
                          key={idx}
                          display="grid"
                          gridTemplateColumns="1.4fr 0.8fr 1fr 0.8fr 0.8fr 1fr"
                          gap={1}
                          mb={0.6}
                          sx={{
                            backgroundColor: getClubColor(idx),
                            borderRadius: 1,
                            px: 1,
                            py: 0.4
                          }}
                        >
                          <Typography variant="caption" noWrap fontWeight={500}>
                            {item.club}
                          </Typography>

                          <Typography variant="caption">
                            {item.cantidad_md}
                          </Typography>

                          <Typography variant="caption">
                            ${item.monto_md.toLocaleString()}
                          </Typography>

                          <Typography variant="caption">
                            {item.cantidad_total}
                          </Typography>

                          <Typography variant="caption" fontWeight="bold">
                            ${item.monto_total.toLocaleString()}
                          </Typography>

                          <Typography variant="caption">
                            ${item.monto_iva.toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
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