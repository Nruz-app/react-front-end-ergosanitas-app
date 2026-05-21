


interface IData {
  rut: string;
  edad: string;
  nombre: string;
  status: string;
  fecha_registro: string;
}

export interface IChequeo {
  club: string;
  monto_pen: number;
  monto_rev: number;
  cantidad_pen: number;
  cantidad_rev: number;
  data: IData[];
}

export interface IPagoMedicoMDC {
  periodo: string;
  monto_total: number;
  cantidad_total: number;
  chequeos: IChequeo[];
}