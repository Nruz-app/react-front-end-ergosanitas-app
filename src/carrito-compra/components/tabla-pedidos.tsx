import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { COLORES } from '../config/tema';
import type { IPaginaPedidos, IPedidoFila } from '../interface';
import { etiquetaMedio, formatoClp, formatoFecha, formatoFechaHora } from '../utilities';
import { ChipEstado } from './chip-estado';

interface Props {
    pagina   : IPaginaPedidos | null;
    cargando : boolean;
    onPagina : (pagina: number) => void;
    onAbrir  : (numero: string) => void;
}

type Fila = IPedidoFila & { id: string };

const COLUMNAS: GridColDef<Fila>[] = [
    { field: 'numero', headerName: 'Pedido', width: 150 },
    { field: 'creado', headerName: 'Creado', width: 150, valueFormatter: (v: string | null) => formatoFechaHora(v) },
    { field: 'fecha', headerName: 'Visita', width: 170, valueGetter: (_v, f) => `${formatoFecha(f.fecha)} · ${f.bloque}` },
    { field: 'comuna', headerName: 'Comuna', width: 140 },
    { field: 'contacto_nombre', headerName: 'Contacto', flex: 1, minWidth: 160 },
    { field: 'pacientes', headerName: 'Pac.', width: 60, align: 'center', headerAlign: 'center' },
    { field: 'total', headerName: 'Total', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v: number) => formatoClp(v) },
    { field: 'medio_pago', headerName: 'Medio', width: 120, valueFormatter: (v: string) => etiquetaMedio(v) },
    { field: 'estado', headerName: 'Estado', width: 160, renderCell: ({ value }) => <ChipEstado estado={value as string} /> },
    { field: 'estado_pago', headerName: 'Pago', width: 120, renderCell: ({ value }) => <ChipEstado estado={value as string} /> },
];

/** Pedidos con paginación de servidor (20 por página). Un click en la fila abre el detalle. */
export const TablaPedidos = ({ pagina, cargando, onPagina, onAbrir }: Props) => (

    <DataGrid
        autoHeight
        rows={(pagina?.items ?? []).map((p) => ({ ...p, id: p.numero }))}
        columns={COLUMNAS}
        loading={cargando}
        paginationMode="server"
        rowCount={pagina?.total ?? 0}
        pageSizeOptions={[20]}
        paginationModel={{ page: (pagina?.pagina ?? 1) - 1, pageSize: 20 }}
        onPaginationModelChange={(m) => onPagina(m.page + 1)}
        onRowClick={({ row }) => onAbrir(row.numero)}
        disableRowSelectionOnClick
        disableColumnMenu
        localeText={{ noRowsLabel: 'No hay pedidos con estos filtros' }}
        sx={{
            borderRadius: 3,
            background: COLORES.fondoTarjeta,
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
        }}
    />
);
