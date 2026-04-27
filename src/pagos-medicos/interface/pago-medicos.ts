export interface PagoDetalle {
  club: string;
  monto_md: number;
  monto_iva: number;
  monto_total: number;
  cantidad_md: number;
  cantidad_total: number;
}

export interface PagoMedico {
  fecha: string;
  monto_md: number;
  monto_iva: number;
  monto_total: number;
   estado: string;
  data: PagoDetalle[];
}