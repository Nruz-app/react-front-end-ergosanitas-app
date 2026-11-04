import * as Yup from 'yup';

import type { IPacienteForm } from '../interface';
import { edadA } from './formato.utility';

/** Mismas expresiones que `Servicios/utilities/agenda-hora-validation.utility.ts`, copiadas: el módulo es autocontenido. */
export const REGEX_RUN = /^\d{7,8}-[\dkK]$/;
export const REGEX_CELULAR = /^\+?\d{9,12}$/;

const esMenor = (fechaNac: string | undefined) => {
    const edad = edadA(fechaNac);
    return edad !== null && edad < 18;
};

/**
 * Datos del paciente para el checkout. El apoderado solo se exige si la fecha de nacimiento da
 * menos de 18 años (consentimiento del apoderado, §4.4 de la especificación de negocio).
 */
export const pacienteSchema: Yup.ObjectSchema<IPacienteForm> = Yup.object({
    nombre: Yup.string().trim().required('Ingresa el nombre').max(250),
    rut: Yup.string()
        .transform((valor: string) => valor.replace(/\./g, '').trim())
        .required('Ingresa el RUT')
        .matches(REGEX_RUN, 'RUT sin puntos y con guion: 12345678-9'),
    fecha_nac: Yup.string()
        .required('Ingresa la fecha de nacimiento')
        .test('pasada', 'La fecha no puede ser futura', (valor) => !valor || new Date(valor) <= new Date()),
    sexo: Yup.mixed<'F' | 'M' | ''>().oneOf(['F', 'M'], 'Selecciona el sexo').required('Selecciona el sexo'),
    prevision: Yup.string().required('Selecciona la previsión'),
    telefono: Yup.string().defined().test('celular', 'Teléfono con código: +56912345678', (valor) => !valor || REGEX_CELULAR.test(valor)),
    email: Yup.string().defined().email('Correo no válido'),
    consentimiento: Yup.boolean().defined().oneOf([true], 'El paciente debe aceptar la atención'),
    apoderado_nombre: Yup.string().defined().when('fecha_nac', {
        is: esMenor,
        then: (s) => s.trim().required('Ingresa el nombre del apoderado'),
    }),
    apoderado_rut: Yup.string().defined().when('fecha_nac', {
        is: esMenor,
        then: (s) => s.required('Ingresa el RUT del apoderado').matches(REGEX_RUN, 'RUT sin puntos y con guion: 12345678-9'),
    }),
    consentimiento_apoderado: Yup.boolean().defined().when('fecha_nac', {
        is: esMenor,
        then: (s) => s.oneOf([true], 'El apoderado debe aceptar la atención'),
    }),
});

export const PACIENTE_VACIO: IPacienteForm = {
    nombre: '',
    rut: '',
    fecha_nac: '',
    sexo: '',
    prevision: '',
    telefono: '',
    email: '',
    consentimiento: false,
    apoderado_nombre: '',
    apoderado_rut: '',
    consentimiento_apoderado: false,
};
