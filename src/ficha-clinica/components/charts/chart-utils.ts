const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// 'YYYY-MM-DD' -> 'ene 26' (etiqueta corta para el eje X).
export const formatFecha = (iso: string): string => {
    const [anio, mes] = iso.split('-');
    const idx = Number(mes) - 1;
    const mesTexto = MESES[idx] ?? mes;
    return `${mesTexto} ${anio.slice(2)}`;
};

/**
 * Etiquetas del eje X a partir de cualquier lista de exámenes con fecha
 * (bioimpedancias o electrocardiogramas).
 *
 * Recibe los registros ya en el orden en que se van a graficar: el modelo los
 * entrega en orden descendente, así que quien llame debe invertir la copia para
 * que el eje X corra de la fecha más antigua a la más reciente.
 */
export const buildLabels = <T extends { fecha: string }>(registros: T[]): string[] =>
    registros.map((registro) => formatFecha(registro.fecha));

export interface CategoriaIMC {
    etiqueta: string;
    color: string;
}

/**
 * Clasifica un IMC en su categoría según los cortes OMS **de adulto**
 * (18.5 / 25 / 30).
 *
 * Ojo: para pacientes pediátricos el IMC se evalúa por percentiles según edad y
 * sexo, no con cortes fijos, así que esta clasificación no les aplica. Por eso la
 * UI rotula el gráfico como "IMC adulto (OMS)" en lugar de afirmar un estado
 * nutricional sin más. Los percentiles pediátricos quedan para otra spec.
 */
export const clasificarIMC = (imc: number | null): CategoriaIMC => {
    if (imc === null) return { etiqueta: 'Sin dato', color: '#9e9e9e' };
    if (imc < 18.5) return { etiqueta: 'Bajo peso', color: '#42a5f5' };
    if (imc < 25) return { etiqueta: 'Normal', color: '#66bb6a' };
    if (imc < 30) return { etiqueta: 'Sobrepeso', color: '#ffa726' };
    return { etiqueta: 'Obesidad', color: '#ef5350' };
};

// Opciones base compartidas por los gráficos de línea/barra.
export const baseLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: {
                font: { size: 12, family: 'Roboto', weight: 'bold' as const },
                color: '#333',
                padding: 15,
                usePointStyle: true,
            },
        },
    },
};
