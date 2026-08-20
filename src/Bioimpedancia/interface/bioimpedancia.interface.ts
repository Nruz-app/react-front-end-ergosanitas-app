


export interface IBioimpedanciaForm {
  nombre?: string;
  rut: string;
  club?: string;
  file?: File | null;
}

export interface IFormErrors {
    nombre?: string;
    rut?: string;
} 

export interface IBioimpedanciaAll {
  // Identificación
  id: number;
  rut: string;
  club: string | null;
  nombre: string | null;
  sexo: string | null;
  edad: number | null;

  // Medidas base
  estatura_cm: number | null;
  peso_kg: number | null;

  // Fecha y hora
  fecha_prueba: string | null;
  hora_prueba: string | null;
  created_at: string | null;
  updated_at: string | null;

  // Composición corporal
  puntaje_corporal: number | null;
  imc: number | null;
  grasa_corporal_pct: number | null;
  masa_grasa_kg: number | null;
  masa_muscular_kg: number | null;
  masa_musculo_esqueletico_kg: number | null;
  masa_libre_grasa_kg: number | null;
  proteinas_kg: number | null;
  minerales_kg: number | null;
  agua_corporal_total_kg: number | null;

  // Metabolismo
  tasa_metabolica_basal_kcal: number | null;
  edad_corporal: number | null;

  // Grasas
  grasa_visceral: number | null;
  grasa_subcutanea_pct: number | null;

  // Indicadores
  smi: number | null;
  whr: number | null;

  // Objetivos / control
  peso_objetivo_kg: number | null;
  control_peso_kg: number | null;
  control_grasa_kg: number | null;
  control_musculo_kg: number | null;

  // Tipo corporal
  tipo_corporal: string | null;

  // Músculo segmentario
  musculo_brazo_derecho_kg: number | null;
  musculo_brazo_izquierdo_kg: number | null;
  musculo_pierna_derecha_kg: number | null;
  musculo_pierna_izquierda_kg: number | null;
  musculo_tronco_kg: number | null;

  // Grasa segmentaria
  grasa_brazo_derecho_kg: number | null;
  grasa_brazo_izquierdo_kg: number | null;
  grasa_pierna_derecha_kg: number | null;
  grasa_pierna_izquierda_kg: number | null;
  grasa_tronco_kg: number | null;

  // Análisis
  asimetrias_relevantes: string | null;
  calidad_extraccion: string | null;

  // Equipo
  marca: string | null;
  equipo: string | null;

  // Archivo / datos originales
  archivo: string | null;
  raw_json: string | null;
}


