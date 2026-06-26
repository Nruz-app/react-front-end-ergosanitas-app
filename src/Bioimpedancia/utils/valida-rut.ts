// utils/rut.ts

export const limpiarRut = (rut: string): string => {
    return rut.replace(/\./g, "").replace("-", "").toUpperCase();
};

export const validarRut = (rut: string): boolean => {
    rut = limpiarRut(rut);

    if (!/^[0-9]+[0-9K]$/.test(rut)) {
        return false;
    }

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);

    const dvCalculado =
        resto === 11 ? "0" :
        resto === 10 ? "K" :
        resto.toString();

    return dv === dvCalculado;
}

export const formatearRut = (rut: string): string => {
    rut = limpiarRut(rut);

    let cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpo}-${dv}`;
}