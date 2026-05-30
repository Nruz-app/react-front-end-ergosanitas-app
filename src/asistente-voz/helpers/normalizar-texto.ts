export const normalizarTexto = (texto: string): string => {

    return texto

        .toLowerCase()

        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

        .replace(/\s+/g, " ")
        .trim()

        // ======================
        // RUT
        // ======================

        .replace(/\bruth\b/g, "rut")
        .replace(/\brutt\b/g, "rut")
        .replace(/\broot\b/g, "rut")
        .replace(/\brutt\b/g, "rut")
        .replace(/\brut de\b/g, "rut")
        .replace(/\brol unico tributario\b/g, "rut")

        // ======================
        // NOMBRE
        // ======================

        .replace(/\bnombre es\b/g, "nombre")
        .replace(/\bmi nombre es\b/g, "nombre")
        .replace(/\bnombre completo\b/g, "nombre")
        .replace(/\bpaciente\b/g, "nombre")

        // ======================
        // FECHA NACIMIENTO
        // ======================

        .replace(
            /\bfecha de nacimiento\b/g,
            "fecha nacimiento"
        )

        .replace(
            /\bnacio el\b/g,
            "fecha nacimiento"
        )

        // ======================
        // SEXO
        // ======================

        .replace(/\bgenero\b/g, "sexo")

        // ======================
        // PESO
        // ======================

        .replace(/\bpeso corporal\b/g, "peso")
        .replace(/\bpesa\b/g, "peso")
        .replace(/\bkilos\b/g, "")
        .replace(/\bkilos\b/g, "")
        .replace(/\bkilogramos\b/g, "")

        // ======================
        // ESTATURA
        // ======================

        .replace(/\bestatura\b/g, "estatura")
        .replace(/\btalla\b/g, "estatura")
        .replace(/\baltura\b/g, "estatura")
        .replace(/\bcentimetros\b/g, "")
        .replace(/\bcentimetro\b/g, "")

        // ======================
        // TEMPERATURA
        // ======================

        .replace(
            /\btemperatura corporal\b/g,
            "temperatura"
        )

        .replace(
            /\btemperatura axilar\b/g,
            "temperatura"
        )

        // ======================
        // SATURACION
        // ======================

        .replace(
            /\bsaturacion de oxigeno\b/g,
            "saturacion"
        )

        .replace(
            /\boxigenacion\b/g,
            "saturacion"
        )

        .replace(
            /\bsaturacion oxigeno\b/g,
            "saturacion"
        )

        // ======================
        // PULSO
        // ======================

        .replace(
            /\bfrecuencia cardiaca\b/g,
            "pulso"
        )

        .replace(
            /\bfrecuencia cardíaca\b/g,
            "pulso"
        )

        .replace(
            /\blatidos por minuto\b/g,
            "pulso"
        )

        // ======================
        // PRESION
        // ======================

        .replace(
            /\bpresion arterial\b/g,
            "presion"
        )

        .replace(
            /\bpresion sanguinea\b/g,
            "presion"
        )

        .replace(
            /\bpresion\b/g,
            "presion"
        )

        // ======================
        // HEMOGLUCOTEST
        // ======================

        .replace(
            /\bglicemia\b/g,
            "hemoglucotest"
        )

        .replace(
            /\bglucosa\b/g,
            "hemoglucotest"
        )

        .replace(
            /\bhemoglucotest\b/g,
            "hemoglucotest"
        )

        // ======================
        // ENFERMEDADES CRONICAS
        // ======================

        .replace(
            /\bpatologias cronicas\b/g,
            "enfermedades cronicas"
        )

        // ======================
        // MEDICAMENTOS
        // ======================

        .replace(
            /\bmedicamentos habituales\b/g,
            "medicamentos diarios"
        )

        .replace(
            /\btratamiento diario\b/g,
            "medicamentos diarios"
        )

        // ======================
        // OBSERVACIONES
        // ======================

        .replace(
            /\bobservaciones\b/g,
            "observacion"
        )

        .replace(
            /\bcomentarios\b/g,
            "observacion"
        )

        .replace(
            /\bnotas\b/g,
            "observacion"
        );
}