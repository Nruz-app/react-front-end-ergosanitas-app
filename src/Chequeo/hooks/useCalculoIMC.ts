


export const useCalculoIMC = async (estatura:string,peso:string) => {


    const estaturaNum: number = parseFloat(estatura); // Usar parseFloat para valores decimales
    const pesoNum: number = parseFloat(peso);
    
    if (isNaN(estaturaNum) || isNaN(pesoNum) || estaturaNum <= 0 || pesoNum <= 0) {
        throw new Error("Valores inválidos para estatura o peso");
    }

    const imc = pesoNum / (estaturaNum * estaturaNum); // Fórmula correcta

    
    return parseFloat(imc.toFixed(1));

    /************************************************************* 
    if(edadNum >= 18) {

        //if (imc < 18.5) categoria = "Bajo peso";
        //    else if (imc < 25) categoria = "Peso normal";
        //    else if (imc < 30) categoria = "Sobrepeso";
        //    else categoria = "Obesidad";

    }
    else {

        const base = sexo_paciente === 'Masculino' 
            ? 16 + (edadNum * 0.23) 
            : 15.5 + (edadNum * 0.21);
            
        const desviacion = sexo_paciente === 'Masculino' 
            ? 1.8 + (edadNum * 0.08)
            : 1.6 + (edadNum * 0.07);
            
        const diferencia = imc - base;
        let percentil = 50 + (diferencia / desviacion) * 34;
            
        // Ajustar límites
        percentil = Math.min(Math.max(percentil, 0.1), 99.9);
            
        //if (percentil < 5) categoria = "Bajo peso";
        //    else if (percentil < 85) categoria = "Peso saludable";
        //    else if (percentil < 95) categoria = "Sobrepeso";
        //    else categoria = "Obesidad";
        

    }
    *****************************************************************************/

}


