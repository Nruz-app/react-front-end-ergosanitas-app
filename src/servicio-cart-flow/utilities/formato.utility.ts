import type { IPacienteCarro } from '../interface';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

/** `$35.000`; `—` cuando no hay valor (nunca `$0` por ausencia). */
export const formatoClp = (monto: number | null | undefined): string =>
    monto === null || monto === undefined ? '—' : CLP.format(monto);

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** "Jueves 5 de noviembre" a partir de "2026-11-05" (sin zona horaria: es una fecha civil). */
export const formatoFecha = (fecha: string): string => {

    const [anio, mes, dia] = fecha.split('-').map(Number);

    if (!anio || !mes || !dia) return fecha;

    const civil = new Date(anio, mes - 1, dia);
    const nombreMes = civil.toLocaleDateString('es-CL', { month: 'long' });
    const diaSemana = DIAS[civil.getDay() === 0 ? 7 : civil.getDay()];

    return `${diaSemana} ${dia} de ${nombreMes}`;
};

/** Nombre visible del paciente en el carro. */
export const nombrePaciente = (paciente: Pick<IPacienteCarro, 'nombre' | 'orden'>): string =>
    paciente.nombre?.trim() || `Paciente ${paciente.orden}`;

/** Edad en años a una fecha de referencia; null si falta la fecha. */
export const edadA = (fechaNac: string | null | undefined, referencia: Date = new Date()): number | null => {

    if (!fechaNac) return null;

    const [anio, mes, dia] = fechaNac.split('-').map(Number);

    if (!anio || !mes || !dia) return null;

    let edad = referencia.getFullYear() - anio;
    const cumplio = referencia.getMonth() + 1 > mes || (referencia.getMonth() + 1 === mes && referencia.getDate() >= dia);

    if (!cumplio) edad--;

    return Math.max(0, edad);
};

/** RUT normalizado: sin puntos, con guion y K mayúscula. */
export const normalizarRut = (rut: string): string => rut.replace(/\./g, '').trim().toUpperCase();
