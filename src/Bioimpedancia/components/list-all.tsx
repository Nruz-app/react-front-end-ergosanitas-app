import {
  DataGridPremium,
  useGridApiRef,
} from '@mui/x-data-grid-premium';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BioimpedanciaService } from '../service/Bioimpedancia';
import { IBioimpedanciaAll } from '../interface/bioimpedancia.interface';

const columns = [
  // 🔹 Identificación base
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'rut', headerName: 'RUT', flex: 1, minWidth: 140 },
  { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 180 },
  { field: 'fecha_prueba', headerName: 'Fecha', width: 120 },
  { field: 'hora_prueba', headerName: 'Hora', width: 100 },

  // 🔹 Datos generales
  { field: 'sexo', headerName: 'Sexo', width: 100 },
  { field: 'edad', headerName: 'Edad', width: 90 },
  { field: 'estatura_cm', headerName: 'Estatura (cm)', width: 120 },
  { field: 'peso_kg', headerName: 'Peso (kg)', width: 110 },

  // 🔹 Composición corporal
  { field: 'imc', headerName: 'IMC', width: 90 },
  { field: 'puntaje_corporal', headerName: 'Score', width: 110 },
  { field: 'grasa_corporal_pct', headerName: 'Grasa %', width: 110 },
  { field: 'masa_grasa_kg', headerName: 'Masa grasa (kg)', width: 150 },
  { field: 'masa_muscular_kg', headerName: 'Masa muscular (kg)', width: 170 },
  { field: 'masa_musculo_esqueletico_kg', headerName: 'Músculo esq.', width: 170 },
  { field: 'proteinas_kg', headerName: 'Proteínas (kg)', width: 140 },
  { field: 'agua_corporal_total_kg', headerName: 'Agua corporal', width: 150 },

  // 🔹 Metabolismo
  { field: 'tasa_metabolica_basal_kcal', headerName: 'TMB', width: 120 },
  { field: 'edad_corporal', headerName: 'Edad corporal', width: 130 },

  // 🔹 Grasas
  { field: 'grasa_visceral', headerName: 'Grasa visceral', width: 140 },
  { field: 'grasa_subcutanea_pct', headerName: 'Subcutánea %', width: 140 },

  // 🔹 Indicadores
  { field: 'smi', headerName: 'SMI', width: 90 },
  { field: 'whr', headerName: 'WHR', width: 90 },

  // 🔹 Objetivos
  { field: 'peso_objetivo_kg', headerName: 'Peso objetivo', width: 140 },
  { field: 'control_peso_kg', headerName: 'Control peso', width: 140 },
  { field: 'peso_sin_grasa_kg', headerName: 'Peso sin grasa', width: 150 },

  // 🔹 Contexto equipo
  { field: 'tipo_corporal', headerName: 'Tipo corporal', width: 140 },
  { field: 'marca', headerName: 'Marca', width: 120 },
  { field: 'equipo', headerName: 'Equipo', width: 120 },

  // 🔹 Auditoría
  { field: 'created_at', headerName: 'Creado', width: 160 },
  { field: 'updated_at', headerName: 'Actualizado', width: 160 },
];

export const ListAll = () => {
  const [rows, setRows] = useState<IBioimpedanciaAll[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiRef = useGridApiRef();

  // Instancia del servicio (evita recrearlo en cada render)
  const service = useMemo(() => BioimpedanciaService(), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

       const { getListAll } = await BioimpedanciaService();
        const response = await getListAll();

      const data: IBioimpedanciaAll[] = response?.data ?? [];
      console.log('Datos obtenidos:', data);  
      const rowsWithId = data.map((item) => ({
        ...item,
        id: item.id, 
      }));

      setRows(rowsWithId);
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
        columns={ columns }
        disableRowSelectionOnClick
      />

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}