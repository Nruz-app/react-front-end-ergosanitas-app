/**
 * Capa 2 — Modelo de UI de la ficha clínica.
 *
 * camelCase, numérico y con unidades ya normalizadas. Es lo que importan los
 * componentes: nadie fuera del mapper toca la forma cruda de `api.interface.ts`.
 *
 * Regla de nulabilidad: todo campo numérico que el backend puede mandar como '' o
 * null se tipa `number | null`, y la UI lo renderiza como '—'. No se mapea la
 * ausencia de dato a 0: un cero en un signo vital es una medición, no un vacío.
 */

export interface IAntecedentes {
    enfermedadesCronicas   : string | null;
    medicamentosDiarios    : string | null;
    enfermedadesAnteriores : string | null;
}

/**
 * Solo el `rut` viene garantizado. El backend responde con el resto en `null` cuando no
 * tiene la ficha demográfica del RUT consultado, así que la UI muestra '—'.
 *
 * `edad` es `null`, nunca 0, cuando no hay fecha de nacimiento: la misma regla que rige
 * los signos vitales. Un cero aquí se leería como un recién nacido.
 */
export interface IPacienteBase {
    rut             : string;
    nombre          : string | null;
    sexo            : string | null;
    fechaNacimiento : string | null;
    edad            : number | null;   // calculada a hoy desde fechaNacimiento
}

export interface IBioimpedancia {
    id                       : number;
    fecha                    : string;          // 'YYYY-MM-DD'
    hora                     : string | null;   // 'HH:mm'

    pesoKg                   : number | null;
    estaturaCm               : number | null;
    imc                      : number | null;

    grasaCorporalPct         : number | null;
    masaGrasaKg              : number | null;
    grasaSubcutaneaPct       : number | null;
    grasaVisceral            : number | null;
    masaMuscularKg           : number | null;
    masaMusculoEsqueleticoKg : number | null;
    smi                      : number | null;
    proteinasKg              : number | null;
    mineralesKg              : number | null;
    aguaCorporalTotalKg      : number | null;
    masaLibreGrasaKg         : number | null;
    whr                      : number | null;

    /**
     * Masa MEDIDA por segmento. `null` cuando el equipo no hace bioimpedancia
     * segmentaria; en ese caso `utilities/segmentacion.ts` cae a la estimación por
     * coeficientes y la UI lo declara.
     *
     * Izquierda y derecha son las del PACIENTE, no las del observador.
     *
     * La suma de los cinco no da el total corporal: el equipo no reparte cabeza ni
     * cuello. Ese residuo se muestra como tal, no se reparte a mano.
     */
    grasaBrazoIzqKg          : number | null;
    grasaBrazoDerKg          : number | null;
    grasaTroncoKg            : number | null;
    grasaPiernaIzqKg         : number | null;
    grasaPiernaDerKg         : number | null;
    musculoBrazoIzqKg        : number | null;
    musculoBrazoDerKg        : number | null;
    musculoTroncoKg          : number | null;
    musculoPiernaIzqKg       : number | null;
    musculoPiernaDerKg       : number | null;

    tasaMetabolicaBasalKcal  : number | null;
    edadCorporal             : number | null;
    puntajeCorporal          : number | null;
    pesoObjetivoKg           : number | null;
    controlPesoKg            : number | null;
    controlGrasaKg           : number | null;
    controlMusculoKg         : number | null;
    tipoCorporal             : string | null;

    marca                    : string | null;
    calidadExtraccion        : string | null;
    asimetriasRelevantes     : string | null;
}

export interface IElectrocardiograma {
    idElectro              : number;
    idChequeo              : number;
    fecha                  : string;          // 'YYYY-MM-DD'

    pesoKg                 : number | null;
    estaturaCm             : number | null;   // ya en cm
    imc                    : number | null;

    presionSistolica       : number | null;
    presionDiastolica      : number | null;
    frecuenciaCardiaca     : number | null;
    saturacionOxigeno      : number | null;
    hemoglucotest          : number | null;
    temperatura            : number | null;

    status                 : string | null;
    estadoPaciente         : string | null;
    derivacion             : string | null;
    observacion            : string | null;
    recuperacion           : string | null;
    sistemaCardiovascular  : string | null;
    sistemaOsteoarticular  : string | null;
    gradoIncidencia        : string | null;

    antecedentes           : IAntecedentes;
}

// Lo que la página recibe del servicio, ya normalizado.
export interface IFichaClinica {
    paciente            : IPacienteBase;
    bioimpedancias      : IBioimpedancia[];        // orden: fecha DESC
    electrocardiogramas : IElectrocardiograma[];   // orden: fecha DESC
}
