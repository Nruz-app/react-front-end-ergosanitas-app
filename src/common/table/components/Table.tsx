import { IColumnsTable, IFilterBase } from "../interface/table.interface";
import { TableContainer, Table as TableMUI, Typography } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  columns: IColumnsTable[];
  hasOptions?: boolean;
  changeColumnSelected: (columnSelected: string) => void;
  changeOrderBy: (orderBy: string) => void;
  filterBase: IFilterBase;
}

export default function Table({
  children,
  columns,
  hasOptions,
  changeColumnSelected,
  filterBase,
  changeOrderBy,
}: Readonly<TableProps>): JSX.Element {
  return (
    <TableContainer
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        display: "flex",
      }}
    >
      <TableMUI
        sx={{ minWidth: 0, maxWidth: "100%" }}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {columns.map((column: IColumnsTable) => (
              <TableCell key={column.column} align="left">
                <Typography
                  fontWeight="fontWeightBold"
                  color={
                    filterBase.columnSelected === column.column
                      ? "primary"
                      : "initial"
                  }
                  sx={{ display: "flex", alignItems: "center" }}
                  onClick={() =>
                    column.isFilterable && changeColumnSelected?.(column.column)
                  }
                >
                  {column.displayName}
                  {filterBase.columnSelected === column.column &&
                    (filterBase.orderBy === "asc" ? (
                      <IconArrowUp
                        fontSize="inherit"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeOrderBy("desc");
                        }}
                        style={{
                          marginLeft: "0.5rem",
                        }}
                      />
                    ) : (
                      <IconArrowDown
                        fontSize="inherit"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeOrderBy("asc");
                        }}
                        style={{
                          marginLeft: "0.5rem",
                        }}
                      />
                    ))}
                </Typography>
              </TableCell>
            ))}

            {hasOptions && (
              <TableCell align="center">
                <Typography fontWeight="fontWeightBold">Opciones</Typography>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </TableMUI>
    </TableContainer>
  );
}
