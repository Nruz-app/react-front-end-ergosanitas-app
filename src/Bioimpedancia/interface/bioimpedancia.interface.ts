


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
  rut: string;
  nombre: string;
  sexo: string;
  edad: number;
  estatura_cm: number;
  peso_kg: number;  
  fecha_prueba: string,
  hora_prueba: string,
  puntaje_corporal: number,
  imc: number,
  grasa_corporal_pct: number,
  masa_grasa_kg: number,
  masa_muscular_kg: number,
  masa_musculo_esqueletico_kg: number,
  proteinas_kg: number,
  agua_corporal_total_kg: number,
  tasa_metabolica_basal_kcal: number,
  grasa_visceral: number,
  edad_corporal: number,
  smi: number,
  peso_sin_grasa_kg: number,
  grasa_subcutanea_pct: number,
  whr: number,
  peso_objetivo_kg: number,
  control_peso_kg: number,
  tipo_corporal: string,
  marca: string,
  equipo: string | null,
  archivo: string,
  raw_json: string,
  updated_at: string,
  created_at: string,
  id: number
}


