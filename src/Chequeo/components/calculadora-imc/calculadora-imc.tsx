

import { Box, Card, Grid, Typography } from '@mui/material'
import { InputText,InputSelect,ButtonsForm } from '../../../components/';
import formIMCJson from '../../config/custom-IMC.json';
import Swal from 'sweetalert2';

import { 
    useFormCalculoIMC,
    useCalculoIMC,
    useCalcularPercentil,
    useIMCRecomendaciones 
} from '../../hooks';

export const CalculadoraImc = () => {


    const { control,handleSubmit,setValue  } = useFormCalculoIMC();  


    const onSubmit = async () => {

        let recomendaciones : string[] = [];
        let categoria : string = '';
        let IMC : number = 0; 
        
        const {edad_paciente,estatura_paciente,peso_paciente,sexo_paciente} = control._formValues || {};
      
        if(estatura_paciente && peso_paciente) {
            IMC = await useCalculoIMC(estatura_paciente,peso_paciente);
        }
        if(edad_paciente >= 18) {

            if(IMC < 18.5) categoria = "Bajo peso";
            else if(IMC < 25) categoria = "Peso normal";
            else if(IMC < 30) categoria = "Sobrepeso";
            else categoria = "Obesidad";
            
        }
        else {
            const percentil = await useCalcularPercentil(edad_paciente,IMC,sexo_paciente);
            
            if (percentil < 5) categoria = "Bajo peso";
            else if (percentil < 85) categoria = "Peso saludable";
            else if (percentil < 95) categoria = "Sobrepeso";
            else categoria = "Obesidad";
        }
        recomendaciones = await useIMCRecomendaciones(edad_paciente,IMC,sexo_paciente);

        Swal.fire({
            icon: 'info',  // Puedes cambiar a 'success', 'warning', 'error', según sea necesario
            title: 'Resultado del IMC',
            html: `
                <div style="text-align: left;">
                    <p><strong>Clasificación pediátrica:</strong> <span style="color: #d9534f;">${categoria}</span></p>
                    <p>(Para ${sexo_paciente} de ${edad_paciente} años)</p>
                    <strong>Recomendaciones:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${recomendaciones.map(r => `<li style="margin-bottom: 5px;">${r}</li>`).join('')}
                    </ul>
                </div>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
        });
                        
    }


  return (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
        }}
        >
        <Card
            sx={{
                textAlign: "center",
                borderRadius: 5,
                boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.1)",  // Sombra más suave y sutil
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                width: "90%",
                border: "1px solid #e0e0e0",  // Borde sutil para el Card
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    color: "primary.main",  // Color primario para el título
                }}
            >
            Calculadora IMC
            </Typography>
            <form onSubmit={handleSubmit(onSubmit) }>
                <Grid container justifyContent="center" spacing={3}  sx={{ mt: 1 }} >
                {
                    formIMCJson.sort((a, b) => a.order - b.order)
                    .map(({ type, name, placeholder, label, defaultValue, 
                        helperText,values }) => {

                        let disabled=false;
        
                        if (type === 'text' || type === 'number') {
                        
                            return (
                                <Grid item xs={12} sm={6} key={name}>
                                    <InputText
                                        control={control}
                                        type={type}
                                        name={name}
                                        placeholder={placeholder}
                                        label={label}
                                        defaultValue={defaultValue}
                                        helperText={helperText}
                                        disabled = { disabled }
                                        setValue = { setValue }  
                                    />
                                </Grid>
                            );
                        }
                        else if (type === 'selected') {
                                
                            return ( 
                            <Grid item xs={12} sm={6} key={name}>

                                    <InputSelect
                                        control={control}
                                        type={type}
                                        name={name}
                                        placeholder={placeholder}
                                        label={label}
                                        defaultValue={defaultValue}
                                        helperText={helperText} 
                                        values = { values! }
                                        setValue = { setValue }
                                    />
                                </Grid>
                            )
                        }
                        throw new Error(`El Type: ${type}, NO es Soportado`);
                    })
                }
                    
                </Grid>
                <Grid item xs={12} sm={12} sx={{ mt: 1 }} >
                    <ButtonsForm 
                        onSubmit = { onSubmit }
                        title = "Calcular"
                    />
                </Grid>
            </form>

        </Card>
    </Box>
  )
}
