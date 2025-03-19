


export const UseCalculoIMC = async (estatura:string,peso:string) => {


    const estaturaNum: number = parseFloat(estatura); // Usar parseFloat para valores decimales
    const pesoNum: number = parseFloat(peso);
    
    if (isNaN(estaturaNum) || isNaN(pesoNum) || estaturaNum <= 0 || pesoNum <= 0) {
        throw new Error("Valores inválidos para estatura o peso");
    }
    const imc = pesoNum / (estaturaNum * estaturaNum); // Fórmula correcta
    return parseFloat(imc.toFixed(1));

}
export const UseCalcularPercentil = async (edad_paciente: number,IMC:number,sexo_paciente : string) => {

    const base = sexo_paciente === 'Masculino' 
            ? 16 + (edad_paciente * 0.23) 
            : 15.5 + (edad_paciente * 0.21);
            
        const desviacion = sexo_paciente === 'Masculino' 
            ? 1.8 + (edad_paciente * 0.08)
            : 1.6 + (edad_paciente * 0.07);
            
        const diferencia = IMC - base;
        let percentil = 50 + (diferencia / desviacion) * 34;
            
        // Ajustar límites
        percentil = Math.min(Math.max(percentil, 0.1), 99.9);

        return percentil;

}

export const UseIMCRecomendaciones = async (edad_paciente: number,IMC:number,sexo_paciente : string) => {

    // eslint-disable-next-line prefer-const
    let recomendaciones : string[] = [];

    if(edad_paciente >= 18) {

        if(IMC < 18.5) {

            recomendaciones.push(
                "Consulta con un nutricionista para ganar peso de forma saludable",
                "Aumenta el consumo de alimentos ricos en nutrientes y calorías saludables",
                "Realiza ejercicios de fuerza para ganar masa muscular",
                "Evita saltarte comidas y mantén horarios regulares"
            );
        }
        else if(IMC < 25) {

            recomendaciones.push(
                "Consulta con un nutricionista para ganar peso de forma saludable",
                "Aumenta el consumo de alimentos ricos en nutrientes y calorías saludables",
                "Realiza ejercicios de fuerza para ganar masa muscular",
                "Evita saltarte comidas y mantén horarios regulares"
            );
        }
        else if(IMC < 30) {
        
            recomendaciones.push(
                "Consulta con un profesional para un plan de pérdida de peso segura",
                "Aumenta tu actividad física gradualmente",
                "Reduce el consumo de alimentos procesados y azúcares",
                "Incorpora más frutas y verduras en tu dieta"
            );
        }
        else {
        
            recomendaciones.push(
                "Busca atención médica especializada",
                "Considera un programa de manejo de peso supervisado",
                "Inicia con actividad física de bajo impacto",
                "Modifica hábitos alimenticios con ayuda profesional"
            );

        }
    }
    else {

        const percentil = await UseCalcularPercentil(edad_paciente,IMC,sexo_paciente);
        
        if(percentil < 5 ) {

            recomendaciones.push(
                "Consulta con el pediatra para evaluación nutricional",
                "Asegurar comidas frecuentes y nutritivas",
                "Evitar largos periodos sin comer",
                "Monitorizar crecimiento y desarrollo"
            );
        }
        else if(percentil < 85) {

            recomendaciones.push(
                "Mantener hábitos alimenticios saludables",
                "Fomentar actividad física diaria",
                "Limitar tiempo de pantallas",
                "Revisiones pediátricas regulares"
            );
        }
        else if(percentil < 95) {

            recomendaciones.push(
                "Consulta con especialista en nutrición infantil",
                "Promover juegos activos y deportes",
                "Reducir bebidas azucaradas y snacks procesados",
                "Establecer rutinas de alimentación familiar"
            );
        }
        else {
            recomendaciones.push(
                "Evaluación médica urgente",
                "Programa de manejo de peso supervisado",
                "Modificaciones dietéticas familiares",
                "Actividad física gradual y constante"
            );
        }

    }
        
    return recomendaciones;

}