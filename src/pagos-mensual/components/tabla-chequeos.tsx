import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

interface IData {
  rut: string;
  edad: string;
  nombre: string;
  status: string;
  fecha_registro: string;
}

interface Props {
  data: IData[];
}

export const TablaChequeos = ({data}: Props) => {

  const formatFecha = (fecha: string) => {

    if (!fecha) return "-";

    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  return (
    <TableContainer
      sx={{
        maxHeight: 350
      }}
    >

      <Table
        stickyHeader
        size="small"
      >

        <TableHead>

          <TableRow>

            <TableCell
              sx={{
                fontWeight: 700,
                backgroundColor: "#eff6ff"
              }}
            >
              RUT
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                backgroundColor: "#eff6ff"
              }}
            >
              NOMBRE
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                backgroundColor: "#eff6ff"
              }}
            >
              EDAD
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                backgroundColor: "#eff6ff"
              }}
            >
              STATUS
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                backgroundColor: "#eff6ff"
              }}
            >
              FECHA REGISTRO
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {Array.isArray(data) &&
          data.length > 0 ? (

            data.map((item, index) => (

              <TableRow
                key={index}
                hover
              >

                <TableCell>
                  {item.rut ?? "-"}
                </TableCell>

                <TableCell>
                  {item.nombre ?? "-"}
                </TableCell>

                <TableCell>
                  {item.edad ?? "-"}
                </TableCell>

                <TableCell>

                  <Chip
                    size="small"
                    label={item.status ?? "-"}
                    color={
                      item.status === "PENDIENTE"
                        ? "warning"
                        : "success"
                    }
                  />

                </TableCell>

                <TableCell>
                  {formatFecha(item.fecha_registro)}
                </TableCell>

              </TableRow>

            ))

          ) : (

            <TableRow>

              <TableCell
                colSpan={5}
                align="center"
              >
                Sin registros
              </TableCell>

            </TableRow>

          )}

        </TableBody>

      </Table>

    </TableContainer>
  );
}