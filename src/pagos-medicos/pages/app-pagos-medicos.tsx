import { Box, Typography } from "@mui/material";
import { ResumenMensual } from "../components/resumen-mensual";

const data = [
    {
        "data": [
            {
                "club": "Colo Colo General Velásquez",
                "monto_md": 27000,
                "monto_iva": 44460,
                "cantidad_md": 9,
                "monto_total": 234000,
                "cantidad_total": 18
            },
            {
                "club": "Unión Española Lampa-Quilicura",
                "monto_md": 0,
                "monto_iva": 79040,
                "cantidad_md": 0,
                "monto_total": 416000,
                "cantidad_total": 32
            },
            {
                "club": "Colo Colo El Bosque",
                "monto_md": 0,
                "monto_iva": 2470,
                "cantidad_md": 0,
                "monto_total": 13000,
                "cantidad_total": 1
            },
            {
                "club": "UC Cerrillos",
                "monto_md": 21000,
                "monto_iva": 17290,
                "cantidad_md": 7,
                "monto_total": 91000,
                "cantidad_total": 7
            },
            {
                "club": "Colegio Altair",
                "monto_md": 0,
                "monto_iva": 133380,
                "cantidad_md": 0,
                "monto_total": 702000,
                "cantidad_total": 54
            },
            {
                "club": "Test Ergosanitas",
                "monto_md": 0,
                "monto_iva": 2470,
                "cantidad_md": 0,
                "monto_total": 13000,
                "cantidad_total": 1
            },
            {
                "club": "Cobresal Buin",
                "monto_md": 0,
                "monto_iva": 143260,
                "cantidad_md": 0,
                "monto_total": 754000,
                "cantidad_total": 58
            },
            {
                "club": "Santiago Morning-Estacion Central",
                "monto_md": 0,
                "monto_iva": 7410,
                "cantidad_md": 0,
                "monto_total": 39000,
                "cantidad_total": 3
            },
            {
                "club": "Club Deportivo Brisas",
                "monto_md": 147000,
                "monto_iva": 279110,
                "cantidad_md": 49,
                "monto_total": 1469000,
                "cantidad_total": 113
            },
            {
                "club": "Samuel Toro Fuentes",
                "monto_md": 6000,
                "monto_iva": 372970,
                "cantidad_md": 2,
                "monto_total": 1963000,
                "cantidad_total": 151
            },
            {
                "club": "Chequeo 1",
                "monto_md": 0,
                "monto_iva": 86450,
                "cantidad_md": 0,
                "monto_total": 455000,
                "cantidad_total": 35
            },
            {
                "club": "Escuela de Futbol Menesianos",
                "monto_md": 0,
                "monto_iva": 148200,
                "cantidad_md": 0,
                "monto_total": 780000,
                "cantidad_total": 60
            },
            {
                "club": "Colo Colo Las Condes",
                "monto_md": 0,
                "monto_iva": 61750,
                "cantidad_md": 0,
                "monto_total": 325000,
                "cantidad_total": 25
            },
            {
                "club": "Colo Colo Isla de Maipo",
                "monto_md": 108000,
                "monto_iva": 108680,
                "cantidad_md": 36,
                "monto_total": 572000,
                "cantidad_total": 44
            }
        ],
        "fecha": "2026-04",
        "estado": "PENDIENTE",
        "monto_md": 309000,
        "monto_iva": 1486940,
        "monto_total": 7826000
    },
    {
        "data": [
            {
                "club": "Colo Colo El Bosque",
                "monto_md": 0,
                "monto_iva": 54340,
                "cantidad_md": 0,
                "monto_total": 286000,
                "cantidad_total": 22
            },
            {
                "club": "Test Ergosanitas",
                "monto_md": 0,
                "monto_iva": 4940,
                "cantidad_md": 0,
                "monto_total": 26000,
                "cantidad_total": 2
            },
            {
                "club": "Chequeo 2",
                "monto_md": 3000,
                "monto_iva": 2470,
                "cantidad_md": 1,
                "monto_total": 13000,
                "cantidad_total": 1
            },
            {
                "club": "Santiago Morning",
                "monto_md": 0,
                "monto_iva": 83980,
                "cantidad_md": 0,
                "monto_total": 442000,
                "cantidad_total": 34
            },
            {
                "club": "Samuel Toro Fuentes",
                "monto_md": 0,
                "monto_iva": 44460,
                "cantidad_md": 0,
                "monto_total": 234000,
                "cantidad_total": 18
            },
            {
                "club": "Natacion San Bernardo",
                "monto_md": 69000,
                "monto_iva": 56810,
                "cantidad_md": 23,
                "monto_total": 299000,
                "cantidad_total": 23
            },
            {
                "club": "Funcional Soccer",
                "monto_md": 0,
                "monto_iva": 9880,
                "cantidad_md": 0,
                "monto_total": 52000,
                "cantidad_total": 4
            },
            {
                "club": "Everton Santiago",
                "monto_md": 0,
                "monto_iva": 64220,
                "cantidad_md": 0,
                "monto_total": 338000,
                "cantidad_total": 26
            },
            {
                "club": "Colo Colo Isla de Maipo",
                "monto_md": 84000,
                "monto_iva": 86450,
                "cantidad_md": 28,
                "monto_total": 455000,
                "cantidad_total": 35
            },
            {
                "club": "UC Cerrillos",
                "monto_md": 24000,
                "monto_iva": 148200,
                "cantidad_md": 8,
                "monto_total": 780000,
                "cantidad_total": 60
            },
            {
                "club": "Colo Colo General Velásquez",
                "monto_md": 75000,
                "monto_iva": 116090,
                "cantidad_md": 25,
                "monto_total": 611000,
                "cantidad_total": 47
            },
            {
                "club": "U de Chile Rugby Club",
                "monto_md": 0,
                "monto_iva": 71630,
                "cantidad_md": 0,
                "monto_total": 377000,
                "cantidad_total": 29
            }
        ],
        "fecha": "2026-03",
        "estado": "PAGADO",
        "monto_md": 255000,
        "monto_iva": 743470,
        "monto_total": 3913000
    }
]

const AppPagosMedicosPage = () => {

    return (
        <>
        <Box ml={15} mt={8} sx={{ flexGrow: 1 }}>
            <Typography
                variant="h4"
                align="center"
                sx={{
                    fontFamily: 'cursive',
                    fontWeight: 'bold',
                    letterSpacing: '0.1rem',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                    mb: 3,
                    animation: 'fadeInDownBig 1s ease-out'
                }}
            >
                Pagos Médicos
            </Typography>
        </Box>
        <ResumenMensual data={data} />
        </>
    )
}

export default AppPagosMedicosPage;