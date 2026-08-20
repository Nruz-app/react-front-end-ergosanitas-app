import {
  DataGridPremium,
  useGridApiRef,
  type GridColDef,
} from '@mui/x-data-grid-premium';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BioimpedanciaService } from '../service/Bioimpedancia';
import { IBioimpedanciaAll } from '../interface/bioimpedancia.interface';

const columns: GridColDef<IBioimpedanciaAll>[] = [
  // Identificación
  {
    field: 'rut',
    headerName: 'RUT',
    width: 130,
  },
  {
    field: 'nombre',
    headerName: 'Nombre',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'fecha_prueba',
    headerName: 'Fecha',
    width: 110,
  },

  // Datos principales
  {
    field: 'edad',
    headerName: 'Edad',
    width: 80,
    type: 'number',
  },
  {
    field: 'estatura_cm',
    headerName: 'Estatura',
    width: 100,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value} cm` : '-',
  },
  {
    field: 'peso_kg',
    headerName: 'Peso',
    width: 100,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value} kg` : '-',
  },

  // Indicadores corporales
  {
    field: 'imc',
    headerName: 'IMC',
    width: 90,
    type: 'number',
  },
  {
    field: 'grasa_corporal_pct',
    headerName: 'Grasa %',
    width: 100,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value}%` : '-',
  },
  {
    field: 'masa_grasa_kg',
    headerName: 'Masa grasa',
    width: 110,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value} kg` : '-',
  },
  {
    field: 'masa_muscular_kg',
    headerName: 'Masa muscular',
    width: 125,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value} kg` : '-',
  },
  {
    field: 'masa_musculo_esqueletico_kg',
    headerName: 'Músculo esquelético',
    width: 150,
    type: 'number',
    valueFormatter: (value) => value != null ? `${value} kg` : '-',
  },

  // Indicadores de salud corporal
  {
    field: 'grasa_visceral',
    headerName: 'Grasa visceral',
    width: 120,
    type: 'number',
  },
  {
    field: 'smi',
    headerName: 'SMI',
    width: 80,
    type: 'number',
  },
  {
    field: 'whr',
    headerName: 'WHR',
    width: 80,
    type: 'number',
  },

  // Metabolismo
  {
    field: 'tasa_metabolica_basal_kcal',
    headerName: 'TMB',
    width: 100,
    type: 'number',
    valueFormatter: (value) =>
      value != null ? `${value} kcal` : '-',
  },

  // Objetivo
  {
    field: 'peso_objetivo_kg',
    headerName: 'Peso objetivo',
    width: 120,
    type: 'number',
    valueFormatter: (value) =>
      value != null ? `${value} kg` : '-',
  },

  // Evaluación
  {
    field: 'puntaje_corporal',
    headerName: 'Score',
    width: 90,
    type: 'number',
  },
  {
    field: 'tipo_corporal',
    headerName: 'Tipo corporal',
    width: 130,
  },
];

export const ListAll = () => {
  const [rows, setRows] = useState<IBioimpedanciaAll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiRef = useGridApiRef();

  const service = useMemo(
    () => BioimpedanciaService(),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { getListAll } = await BioimpedanciaService();
      const response = await getListAll();

      const data: IBioimpedanciaAll[] = response?.data ?? [];

      setRows(data);
    } catch (err) {
      console.error('Error cargando bioimpedancia:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        loading={loading}
        getRowId={(row) => row.id}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}