export interface PagoDetalle {
  club: string;
  periodo: string;
  cantidad: number;
  monto_iva: number;
  monto_mdc: number;
  monto_unitario: number;
  monto_ecg: number;
  descuento: number;
}

export interface PagoMedico {
  periodo: string;
  monto_total_mdc: number;
  monto_total_iva: number;
  monto_total: number;
  descuento_total: number;
  monto_total_final : number;
  estado: string;
  data: PagoDetalle[];
}