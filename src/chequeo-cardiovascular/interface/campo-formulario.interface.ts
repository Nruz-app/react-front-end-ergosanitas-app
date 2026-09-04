/** Una opción de un campo `selected`. */
export interface IOpcionCampo {
    value  : string;
    nombre : string;
}

/** Una regla de validación declarada en el JSON. `value` solo lo usa `MAX`. */
export interface IValidacionCampo {
    type    : string;
    message : string;
    value?  : number;
}

/**
 * Forma de cada entrada de `config/custom-form.json`.
 *
 * `seccion` es el único campo que este módulo agrega respecto al JSON original: es lo que
 * permite agrupar el formulario visualmente sin escribir nombres de campo en el `.tsx`.
 */
export interface ICampoFormulario {
    order         : number;
    type          : string;
    seccion       : string;
    name          : string;
    placeholder   : string;
    label         : string;
    helperText?   : string;
    defaultValue  : string;
    value?        : string;
    values?       : IOpcionCampo[];
    disabledText  : boolean;
    validations   : IValidacionCampo[];
}
