import { Box, Card, Grid, Typography } from '@mui/material';
import Swal from 'sweetalert2';

import { COLORES, SOMBRAS, UI } from '../../config/tema';
import {
    UseCalcularPercentil, UseCalculoIMC, UseIMCRecomendaciones, useFormCalculoIMC,
} from '../../hooks';
import type { CalculadoraIMC } from '../../interface';
import { camposCalculadora, escaparHtml } from '../../utilities';
import { ButtonsForm, InputSelect, InputText } from '../forms';

/**
 * Tab «Calculadora IMC» (en el original el tab se rotulaba por error «Calculos QTC», §6.2).
 *
 * 🔴 **La lógica clínica es la del original, sin tocar** (§7.2): los umbrales 18.5 / 25 / 30
 * del adulto, los percentiles 5 / 85 / 95 del pediátrico (aproximación lineal propia, **no**
 * tablas OMS/CDC), el bug de recomendaciones del adulto con IMC normal, el rótulo
 * «Clasificación pediátrica» que sale también para adultos y el cierre del resultado a los 3 s.
 * Cambiar cualquiera de esas cosas es una decisión médica y va en su propia spec.
 *
 * Lo único que cambia: el botón pasa por `handleSubmit` (D4). El original calculaba con el
 * formulario vacío y daba una clasificación sobre un IMC de 0.
 */
export const CalculadoraImc = () => {

    const { control, handleSubmit, getValues } = useFormCalculoIMC();

    const onSubmit = async () => {

        const { edad_paciente, estatura_paciente, peso_paciente, sexo_paciente } = getValues();

        // El campo llega como texto del input; el original comparaba el texto con `>= 18` y
        // dejaba que JavaScript lo convirtiera. Aquí se convierte una vez, explícitamente.
        const edad = Number(edad_paciente);

        let categoria = '';
        let IMC = 0;

        if (estatura_paciente && peso_paciente) {
            try {
                IMC = await UseCalculoIMC(estatura_paciente, peso_paciente);
            }
            catch {
                Swal.fire({ title: 'Datos inválidos', text: 'Revisa el peso y la estatura (en metros).', icon: 'warning' });
                return;
            }
        }

        if (edad >= 18) {
            if (IMC < 18.5) categoria = 'Bajo peso';
            else if (IMC < 25) categoria = 'Peso normal';
            else if (IMC < 30) categoria = 'Sobrepeso';
            else categoria = 'Obesidad';
        }
        else {
            const percentil = await UseCalcularPercentil(edad, IMC, sexo_paciente);

            if (percentil < 5) categoria = 'Bajo peso';
            else if (percentil < 85) categoria = 'Peso saludable';
            else if (percentil < 95) categoria = 'Sobrepeso';
            else categoria = 'Obesidad';
        }

        const recomendaciones = await UseIMCRecomendaciones(edad, IMC, sexo_paciente);

        Swal.fire({
            icon  : 'info',
            title : 'Resultado del IMC',
            html  : `
                <div style="text-align: left;">
                    <p><strong>Clasificación pediátrica:</strong> <span style="color: ${UI.resultadoImc};">${categoria}</span></p>
                    <p>(Para ${escaparHtml(sexo_paciente)} de ${edad} años)</p>
                    <strong>Recomendaciones:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${recomendaciones.map((r) => `<li style="margin-bottom: 5px;">${r}</li>`).join('')}
                    </ul>
                </div>
            `,
            confirmButtonText  : 'Aceptar',
            confirmButtonColor : UI.confirmar,
            timer              : 3000,
            timerProgressBar   : true,
        });
    };

    const enviar = handleSubmit(onSubmit);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 1 }}>
            <Card
                sx={{
                    textAlign      : 'center',
                    borderRadius   : 5,
                    boxShadow      : SOMBRAS.tabla,
                    display        : 'flex',
                    flexDirection  : 'column',
                    alignItems     : 'center',
                    justifyContent : 'center',
                    p              : { xs: 2, md: 4 },
                    width          : { xs: '100%', md: '90%' },
                    border         : `1px solid ${COLORES.borde}`,
                }}
            >
                <Typography component="h2" variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Calculadora IMC
                </Typography>

                <form onSubmit={enviar} noValidate>
                    <Grid container justifyContent="center" spacing={3} sx={{ mt: 1 }}>
                        {camposCalculadora.map(({ type, name, placeholder, label, helperText, values }) => {

                            const nombre = name as keyof CalculadoraIMC;

                            if (type === 'text' || type === 'number') {
                                return (
                                    <Grid item xs={12} sm={6} key={name}>
                                        <InputText
                                            control={control}
                                            type={type}
                                            name={nombre}
                                            placeholder={placeholder}
                                            label={label}
                                            helperText={helperText}
                                            disabled={false}
                                        />
                                    </Grid>
                                );
                            }

                            if (type === 'selected') {
                                return (
                                    <Grid item xs={12} sm={6} key={name}>
                                        <InputSelect
                                            control={control}
                                            name={nombre}
                                            placeholder={placeholder}
                                            label={label}
                                            helperText={helperText}
                                            values={values ?? []}
                                            disabled={false}
                                        />
                                    </Grid>
                                );
                            }

                            throw new Error(`El type "${type}" no está soportado en la calculadora.`);
                        })}
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <ButtonsForm onSubmit={enviar} title="Calcular" btnStatus={false} />
                    </Box>
                </form>
            </Card>
        </Box>
    );
};
