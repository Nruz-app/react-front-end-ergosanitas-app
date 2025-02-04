import { Grid, Alert, AlertTitle } from "@mui/material"

interface Props  {

    titulo      : string 
    descripcion : string
    precio      : number
}


export const AlertaPrecio = ({titulo,descripcion,precio}: Props) => {
  return (
    <Grid item xs={12} sm={12}>
        <Alert 
            severity="info" 
            sx={{ 
                backgroundColor: '#f0f4ff', 
                color: '#2e3b4e', 
                borderRadius: '8px', 
                padding: '16px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
            }}
        >
            <AlertTitle 
                sx={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: '#1e40af' 
                }}
            >
                { titulo }
            </AlertTitle>
                { descripcion }
            <strong 
                style={{ 
                    fontSize: '1.1rem', 
                    color: '#1e40af' 
                    }}
            >
                {
                  
                  (precio / 1000).toLocaleString('es-ES', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })
                } 
            </strong>
        </Alert>
    </Grid>
  )
}
