import { Switch, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { COLORES } from '../config/tema';
import type { IProductoAdmin } from '../interface';
import { formatoClp } from '../utilities';

interface Props {
    productos : IProductoAdmin[];
    cargando  : boolean;
    onVisible : (producto: IProductoAdmin, visible: boolean) => void;
}

/** Catálogo completo (también lo oculto) con el interruptor «Mostrar en la tienda». */
export const TablaCatalogo = ({ productos, cargando, onVisible }: Props) => {

    const columnas: GridColDef<IProductoAdmin>[] = [
        {
            field: 'visible_tienda', headerName: 'En tienda', width: 100, sortable: true,
            renderCell: ({ row }) => (
                <Switch checked={row.visible_tienda} disabled={cargando} color="success"
                    inputProps={{ 'aria-label': `Mostrar ${row.nombre} en la tienda` }}
                    onChange={(e) => onVisible(row, e.target.checked)} />
            ),
        },
        { field: 'nombre', headerName: 'Producto', flex: 1, minWidth: 220 },
        { field: 'sku', headerName: 'SKU', width: 190 },
        { field: 'categoria', headerName: 'Categoría', width: 220 },
        { field: 'tipo', headerName: 'Tipo', width: 140 },
        { field: 'precio', headerName: 'Precio', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v: number | null) => formatoClp(v) },
        {
            field: 'publicable', headerName: 'Publicable', width: 110,
            renderCell: ({ row }) => (row.publicable
                ? 'Sí'
                : <Tooltip title={row.motivo_no_publicable ?? 'Sin motivo informado'}><span>No ⓘ</span></Tooltip>),
        },
    ];

    return (
        <DataGrid
            autoHeight
            rows={productos}
            columns={columnas}
            loading={cargando}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            localeText={{ noRowsLabel: 'Sin productos' }}
            sx={{ borderRadius: 3, background: COLORES.fondoTarjeta, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }}
        />
    );
};
