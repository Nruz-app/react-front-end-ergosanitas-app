export const limpiarRut = (rut: string): string => {

    return rut
        .replace(/[^\dkK]/gi, "")
        .toUpperCase();
}