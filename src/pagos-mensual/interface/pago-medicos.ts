export interface PagoDetalle {
  club: string;
  periodo: string;
  cantidad_ecg: number;
  monto_iva: number;
  monto_unitario: number;
  monto_ecg: number;
  descuento: number;
  monto_mdc_pen: number;
  monto_mdc_rev: number;
  cantidad_mdc_pen: number;
  cantidad_mdc_rev: number;
}

export interface PagoMedico {
  periodo: string;
  monto_total_iva: number;
  monto_total: number;
  monto_total_mdc: number;
  descuento_total: number;
  monto_total_final : number;
  cantidad_total_ecg : number;
  cantidad_total_pen: number;
  cantidad_total_rev: number;
  monto_total_mdc_pen: number;
  monto_total_mdc_rev: number;
  estado: string;
  data: PagoDetalle[];
}