import { MenuItem, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { ESTADOS_COTIZACION } from '../config/textos';
import { COLORES } from '../config/tema';
import type { ICotizacion } from '../interface';
import { etiquetaEstado, formatoFecha, formatoFechaHora } from '../utilities';

interface Props {
    cotizaciones : ICotizacion[];
    cargando     : boolean;
    onEstado     : (id: number, estado: string) => void;
}

/** Solicitudes de cotización con su estado editable en la misma fila. */
export const TablaCotizaciones = ({ cotizaciones, cargando, onEstado }: Props) => {

    const columnas: GridColDef<ICotizacion>[] = [
        { field: 'created_at', headerName: 'Recibida', width: 150, valueFormatter: (v: string | null) => formatoFechaHora(v) },
        { field: 'organizacion', headerName: 'Organización', width: 160, valueFormatter: (v: string | null) => v ?? '—' },
        { field: 'comuna', headerName: 'Comuna', width: 130 },
        { field: 'servicio', headerName: 'Servicio', flex: 1, minWidth: 200 },
        { field: 'personas', headerName: 'Personas', width: 90, valueFormatter: (v: number | null) => (v === null ? '—' : String(v)) },
        { field: 'fecha_tentativa', headerName: 'Fecha', width: 110, valueFormatter: (v: string | null) => formatoFecha(v) },
        { field: 'contacto_nombre', headerName: 'Contacto', width: 160 },
        { field: 'contacto_email', headerName: 'Correo', width: 190 },
        { field: 'contacto_telefono', headerName: 'Teléfono', width: 130 },
        {
            field: 'estado', headerName: 'Estado', width: 150, sortable: false,
            renderCell: ({ row }) => (
                <TextField select size="small" variant="standard" value={row.estado} disabled={cargando}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onEstado(row.id, e.target.value)}>
                    {ESTADOS_COTIZACION.map((e) => <MenuItem key={e} value={e}>{etiquetaEstado(e)}</MenuItem>)}
                </TextField>
            ),
        },
    ];

    return (
        <DataGrid
            autoHeight
            rows={cotizaciones}
            columns={columnas}
            loading={cargando}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            pageSizeOptions={[20, 50]}
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            disableColumnMenu
            localeText={{ noRowsLabel: 'No hay cotizaciones' }}
            sx={{ borderRadius: 3, background: COLORES.fondoTarjeta, '& .MuiDataGrid-cell': { py: 1 }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }}
        />
    );
};
