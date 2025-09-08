import Box from '@mui/material/Box';
import {
  DataGridPremium,
  //GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  useGridApiRef,
  //useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { useCallback, useEffect, useState } from 'react';
import { UseIncidentesService } from '../../../Incidentes';
import { IIncidentes } from '../../../Incidentes/interface/incidentes.interface';

import {  GridColDef } from '@mui/x-data-grid';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HealingIcon from '@mui/icons-material/Healing';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Chip } from '@mui/material';

interface Props {
  user_email: string;
}

export const TableEm = ({ user_email }: Props) => {
  const [incidentesRow, setIncidentesRow] = useState<IIncidentes[]>([]);
  const [loading, setLoading] = useState(true);
  const apiRef = useGridApiRef();

  // Traer datos del servicio
  const fetchServicios = useCallback(async () => {
    try {
      const { getIncidentesFindByUser } = await UseIncidentesService();
      const responseIncidentes = await getIncidentesFindByUser(user_email);

      // Asegurar campo "id" único requerido por DataGridPremium
      const rowsWithId = responseIncidentes.map((item: IIncidentes, index: number) => ({
        id: item.id ?? index,
        ...item,
      }));

      setIncidentesRow(rowsWithId);
    } catch (error) {
      console.error('Error cargando incidentes:', error);
    } finally {
      setLoading(false);
    }
  }, [user_email]);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

const columns: GridColDef[] = [
  { 
    field: 'nombres', 
    headerName: 'Nombres', 
    flex: 0.5,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <SportsSoccerIcon color="primary" fontSize="small" />
        <span>&nbsp;&nbsp;Nombres</span>
      </div>
    ),
  },
  { 
    field: 'liga', 
    headerName: 'Club', 
    flex: 0.5,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <MedicalServicesIcon color="success" fontSize="small" />
        <span>&nbsp;&nbsp;Club</span>
      </div>
    ),
  },
  { 
    field: 'edad', 
    headerName: 'Edad', 
    flex: 0.3,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <AccessTimeIcon color="secondary" fontSize="small" />
        <span>&nbsp;&nbsp;Edad</span>
      </div>
    ),
  },
  { 
    field: 'tipo_lesion', 
    headerName: 'Tipo Lesión', 
    flex: 0.7,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <HealingIcon color="error" fontSize="small" />
        <span>&nbsp;&nbsp;Tipo Lesión</span>
      </div>
    ),
  },
  { 
    field: 'parte_cuerpo', 
    headerName: 'Parte del Cuerpo', 
    flex: 0.7,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <FitnessCenterIcon color="warning" fontSize="small" />
        <span>&nbsp;&nbsp;Parte del Cuerpo</span>
      </div>
    ),
  },
  { 
    field: 'gravedad', 
    headerName: 'Gravedad', 
    flex: 0.5,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <ReportProblemIcon color="error" fontSize="small" />
        <span>&nbsp;&nbsp;Gravedad</span>
      </div>
    ),
    renderCell: (params) => {
      let color: "success" | "warning" | "error" = "success";
      if (params.value?.toLowerCase().includes("moderada")) {
        color = "warning";
      } else if (params.value?.toLowerCase().includes("grave")) {
        color = "error";
      }
      return (
        <Chip 
          label={params.value} 
          color={color} 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      );
    }
  },
];
  /**** Mantener agrupación y estado inicial ************************************
  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: { model: ['nombres'] }, // ejemplo de agrupación por estado
      sorting: {
        sortModel: [
          { field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD, sort: 'asc' },
        ],
      },
    },
  });
  ***********************************************************************************/

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGridPremium
        rows={incidentesRow}
        columns={columns}
        apiRef={apiRef}
        loading={loading}
        disableRowSelectionOnClick
        // initialState={initialState}
        initialState={{
          sorting: {
            sortModel: [{ field: 'id', sort: 'asc' }], // ejemplo: ordenar por ID
          },
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        showToolbar
        checkboxSelection
      />
    </Box>
  );
};