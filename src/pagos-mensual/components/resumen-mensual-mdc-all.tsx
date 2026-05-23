import { Box } from "@mui/material";
import { useState } from "react";

import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";
import { PeriodoAccordion } from "./periodo-accordion";

interface Props {
  pagoMensualMDC: IPagoMedicoMDC[];
}

export const ResumenMensualMDC = ({pagoMensualMDC}: Props) => {

  const periodosOrdenados = [...(pagoMensualMDC ?? [])]
    .sort((a, b) => b.periodo.localeCompare(a.periodo));

  const [expandedPeriodo, setExpandedPeriodo] = useState<string | false>(
      periodosOrdenados.length > 0
        ? periodosOrdenados[0].periodo
        : false
    );

    const handlePeriodoChange =(panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPeriodo(isExpanded ? panel : false);
    }

  return (
    <Box p={3}>

      {(periodosOrdenados ?? []).map((periodo, index) => (

        <PeriodoAccordion
          key={index}
          periodo={periodo}
          expanded={expandedPeriodo === periodo.periodo}
          onChange={handlePeriodoChange(periodo.periodo)}
        />

      ))}

    </Box>
  );
}