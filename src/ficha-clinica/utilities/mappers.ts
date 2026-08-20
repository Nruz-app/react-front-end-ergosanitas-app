import type {
    IAntecedentes,
    IBioimpedancia,
    IBioimpedanciaRaw,
    IElectrocardiograma,
    IElectrocardiogramaRaw,
    IFichaClinica,
    IFichaClinicaResponse,
    IPacienteBase,
    IPacienteRaw,
} from '../interface';

import {
    aCentimetros,
    aFechaISO,
    aHoraCorta,
    aNumero,
    calcularEdad,
    primerValor,
} from './parse';

/**
 * Mapper de la ficha clínica: única frontera entre la forma cruda del backend y el
 * modelo de UI. Aplica la tabla de reglas de normalización de la Spec 02.
 *
 * Nadie más debe interpretar el payload: si el backend cambia, se cambia aquí.
 */

/** Texto del backend, con el vacío tratado como ausencia. Preserva saltos de línea. */
const aTexto = (valor: string | null | undefined): string | null => {

    if (valor === null || valor === undefined) return null;

    const limpio = valor.trim();
    return limpio === '' ? null : limpio;
};

/**
 * Orden descendente por fecha: el examen más reciente queda primero.
 *
 * Los registros con fecha inválida (`''` según `aFechaISO`) se mandan al final,
 * para que nunca ocupen la posición 0, de la que sale el snapshot del tab Home.
 */
const porFechaDesc = <T extends { fecha: string }>(a: T, b: T): number => {

    if (a.fecha === b.fecha) return 0;
    if (a.fecha === '') return 1;
    if (b.fecha === '') return -1;

    return a.fecha < b.fecha ? 1 : -1;
};

/**
 * Identidad del paciente.
 *
 * Solo el `rut` viene garantizado: es el parámetro de la consulta. Nombre, sexo y fecha
 * de nacimiento llegan `null` cuando el backend no tiene ficha demográfica de ese RUT.
 */
const mapPaciente = (raw: IPacienteRaw): IPacienteBase => ({
    rut             : raw.rut,
    nombre          : aTexto(raw.nombre),
    sexo            : aTexto(raw.sexo),
    // `aFechaISO` devuelve '' para lo inválido; aquí eso es ausencia de dato.
    fechaNacimiento : aFechaISO(raw.fechaNacimiento) || null,
    // La edad se calcula a hoy: la que traen los exámenes está congelada.
    edad            : calcularEdad(raw.fechaNacimiento),
});

const mapBioimpedancia = (raw: IBioimpedanciaRaw): IBioimpedancia => ({
    id                       : raw.id,
    fecha                    : aFechaISO(raw.fecha_prueba),
    hora                     : aHoraCorta(raw.hora_prueba),

    pesoKg                   : aNumero(raw.peso_kg),
    estaturaCm               : aCentimetros(raw.estatura_cm),
    imc                      : aNumero(raw.imc),

    grasaCorporalPct         : aNumero(raw.grasa_corporal_pct),
    masaGrasaKg              : aNumero(raw.masa_grasa_kg),
    grasaSubcutaneaPct       : aNumero(raw.grasa_subcutanea_pct),
    grasaVisceral            : aNumero(raw.grasa_visceral),
    masaMuscularKg           : aNumero(raw.masa_muscular_kg),
    masaMusculoEsqueleticoKg : aNumero(raw.masa_musculo_esqueletico_kg),
    smi                      : aNumero(raw.smi),
    proteinasKg              : aNumero(raw.proteinas_kg),
    mineralesKg              : aNumero(raw.minerales_kg),
    aguaCorporalTotalKg      : aNumero(raw.agua_corporal_total_kg),
    masaLibreGrasaKg         : aNumero(raw.masa_libre_grasa_kg),
    whr                      : aNumero(raw.whr),

    // Masa medida por segmento. Se pasa tal cual: el reparto por coeficientes solo
    // entra como respaldo, y esa decisión vive en `segmentacion.ts`, no aquí.
    grasaBrazoIzqKg          : aNumero(raw.grasa_brazo_izquierdo_kg),
    grasaBrazoDerKg          : aNumero(raw.grasa_brazo_derecho_kg),
    grasaTroncoKg            : aNumero(raw.grasa_tronco_kg),
    grasaPiernaIzqKg         : aNumero(raw.grasa_pierna_izquierda_kg),
    grasaPiernaDerKg         : aNumero(raw.grasa_pierna_derecha_kg),
    musculoBrazoIzqKg        : aNumero(raw.musculo_brazo_izquierdo_kg),
    musculoBrazoDerKg        : aNumero(raw.musculo_brazo_derecho_kg),
    musculoTroncoKg          : aNumero(raw.musculo_tronco_kg),
    musculoPiernaIzqKg       : aNumero(raw.musculo_pierna_izquierda_kg),
    musculoPiernaDerKg       : aNumero(raw.musculo_pierna_derecha_kg),

    tasaMetabolicaBasalKcal  : aNumero(raw.tasa_metabolica_basal_kcal),
    edadCorporal             : aNumero(raw.edad_corporal),
    puntajeCorporal          : aNumero(raw.puntaje_corporal),
    pesoObjetivoKg           : aNumero(raw.peso_objetivo_kg),
    controlPesoKg            : aNumero(raw.control_peso_kg),
    controlGrasaKg           : aNumero(raw.control_grasa_kg),
    controlMusculoKg         : aNumero(raw.control_musculo_kg),
    tipoCorporal             : aTexto(raw.tipo_corporal),

    marca                    : aTexto(raw.marca),
    calidadExtraccion        : aTexto(raw.calidad_extraccion),
    asimetriasRelevantes     : aTexto(raw.asimetrias_relevantes),

    // Descartados a propósito: `rut`, `nombre`, `edad` y `sexo` duplican la identidad
    // del paciente (y en el mock la contradicen); `club`, `equipo`, `archivo`,
    // `raw_json`, `created_at` y `updated_at` no se usan en la ficha.
});

const mapAntecedentes = (raw: IElectrocardiogramaRaw): IAntecedentes => ({
    enfermedadesCronicas   : aTexto(raw.enfermedadesCronicas),
    medicamentosDiarios    : aTexto(raw.medicamentosDiarios),
    enfermedadesAnteriores : aTexto(raw.enfermedadesAnteriores),
});

const mapElectrocardiograma = (raw: IElectrocardiogramaRaw): IElectrocardiograma => ({
    idElectro              : raw.id_electro,
    idChequeo              : raw.id_chequeo,
    fecha                  : aFechaISO(raw.fecha_atencion),

    pesoKg                 : aNumero(raw.peso),
    // El electro manda la estatura en metros ('1.47'): se normaliza a centímetros.
    estaturaCm             : aCentimetros(raw.estatura),
    // Tres columnas de IMC y solo una poblada: se prefiere la del paciente.
    imc                    : primerValor(raw.imc_paciente, raw.imc, raw.imc_electro),

    presionSistolica       : aNumero(raw.presion_sistolica),
    // `presionArterial` es la diastólica: llega '74' junto a presion_sistolica '107'.
    presionDiastolica      : aNumero(raw.presionArterial),
    frecuenciaCardiaca     : primerValor(raw.frecuencia_cardiaca_paciente, raw.pulso),
    saturacionOxigeno      : aNumero(raw.saturacionOxigeno),
    hemoglucotest          : aNumero(raw.hemoglucotest),
    temperatura            : aNumero(raw.temperatura),

    status                 : aTexto(raw.status),
    estadoPaciente         : aTexto(raw.estado_paciente),
    derivacion             : aTexto(raw.derivacion_paciente),
    observacion            : aTexto(raw.observacion_paciente),
    recuperacion           : aTexto(raw.Recuperacion),
    sistemaCardiovascular  : aTexto(raw.sistemaCardiovascular),
    sistemaOsteoarticular  : aTexto(raw.sistemaOsteoarticular),
    gradoIncidencia        : aTexto(raw.gradoIncidenciaPosterio),

    antecedentes           : mapAntecedentes(raw),

    // Descartados a propósito: `rut_paciente` y `edad` duplican la identidad del
    // paciente; `created_at_electro` y `updated_at_electro` no se usan en la ficha.
});

/** Normaliza la respuesta cruda del backend al modelo de UI de la ficha clínica. */
export const mapFichaClinica = (raw: IFichaClinicaResponse): IFichaClinica => {

    const ficha = raw.data.ficha_clinica;

    // `?? []` cubre el caso de que alguna llave cambie de nombre en el backend: la
    // ficha degrada al estado vacío del tab en lugar de reventar.
    const bioimpedancias = (ficha.bioimpedancias ?? [])
        .map((registro) => mapBioimpedancia(registro))
        .sort(porFechaDesc);

    const electrocardiogramas = (ficha.electrocardiogramas ?? [])
        .map((registro) => mapElectrocardiograma(registro))
        .sort(porFechaDesc);

    return {
        paciente: mapPaciente(ficha.paciente),
        bioimpedancias,
        electrocardiogramas,
    };
};
