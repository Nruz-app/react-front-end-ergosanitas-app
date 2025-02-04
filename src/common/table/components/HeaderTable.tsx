import { Button, Stack, TextField } from "@mui/material";
import { IconAdjustmentsAlt } from "@tabler/icons-react";
//import Link from "next/link";

export default function HeaderTable({
  search,
  openFilters,
  toggleFilters,
  changeSearch,
  href,
}: {
  search?: string;
  href?: string;
  openFilters: boolean;
  toggleFilters: (open: boolean) => void;
  changeSearch: (search: string) => void;
}): JSX.Element {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Button
        onClick={() => toggleFilters(!openFilters)}
        startIcon={<IconAdjustmentsAlt />}
      >
        Filtros
      </Button>

      <TextField
        label="Buscar"
        id="search"
        name="search" // Agrega esta línea
        value={search || ""}
        variant="outlined"
        size="small"
        style={{
          width: "30rem",
          minWidth: "10rem",
          maxWidth: "30rem",
          marginRight: "1rem",
          marginLeft: "1rem",
        }}
        onChange={(e) => changeSearch(e.target.value)}
      />
      {href && (
        <div>
          <Button
            //component={Link}
            href={href}
            variant="contained"
            style={{ backgroundColor: "#FF9012", color: "#FFFFFF" }}
          >
            Agregar
          </Button>
        </div>
      )}
    </Stack>
  );
}
