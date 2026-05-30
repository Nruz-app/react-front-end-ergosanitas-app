import { IChequeo }
from "../interface/chequeo.interface";

import { normalizarTexto }
from "./normalizar-texto";

export const extraerChequeo = (texto: string): Partial<IChequeo> => {

    const t = normalizarTexto(texto);

    return {

        nombre:
            t.match(
                /nombre\s+(.+?)(?=\s+rut|\s+fecha nacimiento|\s+edad|$)/i
            )?.[1]?.trim(),

        rut:
            t.match(
                /rut\s+([\d\skK.-]+)/i
            )?.[1]
                ?.replace(/\s+/g, "")
                ?.toUpperCase(),

        fechaNacimiento:
            t.match(
                /fecha nacimiento\s+(.+?)(?=\s+edad|$)/i
            )?.[1]?.trim(),

        edad:
            t.match(
                /edad\s+(\d+)/i
            )?.[1],

        sexo_paciente:
            t.match(
                /sexo\s+(masculino|femenino)/i
            )?.[1],

        peso:
            t.match(
                /peso\s+(\d+)/i
            )?.[1],

        estatura:
            t.match(
                /estatura\s+(\d+)/i
            )?.[1],

        temperatura:
            t.match(
                /temperatura\s+([\d.,]+)/i
            )?.[1],

        saturacionOxigeno:
            t.match(
                /saturacion\s+(\d+)/i
            )?.[1],

        pulso:
            t.match(
                /pulso\s+(\d+)/i
            )?.[1],

        hemoglucotest:
            t.match(
                /hemoglucotest\s+(\d+)/i
            )?.[1],

        observacion_paciente:
            t.match(
                /observacion\s+(.+)/i
            )?.[1]?.trim()
    };
};