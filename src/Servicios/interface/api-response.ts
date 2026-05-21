export interface ApiResponse<T> {
  data: T;
  status: string;
  mensaje: string;
}