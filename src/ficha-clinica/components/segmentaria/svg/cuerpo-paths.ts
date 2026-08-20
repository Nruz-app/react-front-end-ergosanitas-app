/**
 * Geometría de la silueta corporal.
 *
 * Un único set de paths GENERAL: no hay variantes por sexo ni por edad. La imagen es
 * constante para todos los pacientes; lo único dinámico es el color de cada región y
 * las cifras que la acompañan (Spec 03).
 *
 * Construcción
 * ------------
 * - Lienzo `0 0 400 640`, figura centrada en el eje `x = 200`, de y=26 (coronilla) a
 *   y=629 (planta del pie).
 * - Los lados se generaron por espejo exacto (`x -> 400 - x`) del lado derecho del
 *   paciente, de modo que la simetría es exacta por construcción y no por pulso.
 * - Contorno en curvas cúbicas: no hay polilíneas rectas en hombros, cintura, caderas
 *   ni pantorrillas. Las únicas rectas son cortes entre regiones, no contorno.
 *
 * Regiones disjuntas
 * ------------------
 * Los seis paths son cerrados y sus interiores no se solapan. Comparten frontera:
 * - cabeza / tronco: la base del cuello en y=124.
 * - tronco / brazo: la curva del costado del tórax, de (155,133) a (150,196). El brazo
 *   la recorre invertida, con los mismos puntos de control, así que encajan sin holgura.
 * - tronco / pierna: el borde inferior de la cadera, de (149,346) a (200,358).
 * El deltoides pertenece al BRAZO, no al tronco: es el corte que usan los informes de
 * bioimpedancia segmentaria, y evita que la línea de separación parezca una manga.
 *
 * Lateralidad
 * -----------
 * IZQ y DER son del PACIENTE. Como la silueta se mira de frente, `BRAZO_IZQ` y
 * `PIERNA_IZQ` se dibujan en la mitad DERECHA de la pantalla (x > 200).
 */

/** Lienzo de referencia. Todo path de este archivo está en estas coordenadas. */
export const VIEWBOX = '0 0 400 640';

/** Eje de simetría. Los marcadores y callouts se posicionan respecto a él. */
export const EJE_X = 200;

/**
 * Cráneo, mandíbula y cuello. Cierra en la base del cuello (y=124),
 * donde apoya el tronco. No recibe masa: es región dibujable, no segmento.
 */
export const PATH_CABEZA = `
    M 200 26
    C 212 26 222 35 225 48
    C 227 58 226 69 222 78
    C 219 86 215 91 210 95
    C 208 101 208 108 209 114
    C 211 119 215 122 220 124
    L 180 124
    C 185 122 189 119 191 114
    C 192 108 192 101 190 95
    C 185 91 181 86 178 78
    C 174 69 173 58 175 48
    C 178 35 188 26 200 26
    Z
`;

/**
 * Tórax, abdomen y pelvis, sin los deltoides. Absorbe la masa de la
 * cabeza, igual que el vector de coeficientes de `segmentacion.ts`.
 */
export const PATH_TRONCO = `
    M 180 124
    C 170 126 161 129 155 133
    C 152 155 150 175 150 196
    C 152 216 156 234 158 252
    C 158 270 155 286 152 302
    C 149 316 147 330 149 346
    C 165 354 183 358 200 358
    C 217 358 235 354 251 346
    C 253 330 251 316 248 302
    C 245 286 242 270 242 252
    C 244 234 248 216 250 196
    C 250 175 248 155 245 133
    C 239 129 230 126 220 124
    Z
`;

/**
 * Brazo izquierdo del paciente: se dibuja a la DERECHA de la pantalla.
 */
export const PATH_BRAZO_IZQ = `
    M 245 133
    C 257 136 268 143 274 156
    C 279 169 281 183 281 197
    C 284 219 287 241 290 262
    C 293 284 296 305 298 324
    C 300 342 302 358 303 372
    C 305 382 306 390 305 398
    C 308 406 307 416 301 420
    C 294 423 287 419 284 411
    C 282 404 282 396 283 389
    C 281 372 278 354 275 336
    C 272 314 268 290 264 266
    C 261 244 256 220 250 196
    C 250 175 248 155 245 133
    Z
`;

/**
 * Brazo derecho del paciente: se dibuja a la IZQUIERDA de la pantalla.
 */
export const PATH_BRAZO_DER = `
    M 155 133
    C 143 136 132 143 126 156
    C 121 169 119 183 119 197
    C 116 219 113 241 110 262
    C 107 284 104 305 102 324
    C 100 342 98 358 97 372
    C 95 382 94 390 95 398
    C 92 406 93 416 99 420
    C 106 423 113 419 116 411
    C 118 404 118 396 117 389
    C 119 372 122 354 125 336
    C 128 314 132 290 136 266
    C 139 244 144 220 150 196
    C 150 175 152 155 155 133
    Z
`;

/**
 * Pierna izquierda del paciente: mitad DERECHA de la pantalla.
 */
export const PATH_PIERNA_IZQ = `
    M 251 346
    C 253 370 254 392 255 412
    C 256 426 257 438 257 448
    C 254 466 250 484 248 504
    C 247 530 248 558 249 578
    C 250 588 251 596 252 604
    C 259 611 265 617 262 623
    C 252 629 232 629 219 625
    C 212 621 211 613 214 605
    C 217 595 219 587 220 578
    C 220 558 219 530 218 504
    C 216 484 214 466 213 448
    C 212 438 211 426 210 412
    C 208 392 205 370 200 358
    C 217 358 235 354 251 346
    Z
`;

/**
 * Pierna derecha del paciente: mitad IZQUIERDA de la pantalla.
 */
export const PATH_PIERNA_DER = `
    M 149 346
    C 147 370 146 392 145 412
    C 144 426 143 438 143 448
    C 146 466 150 484 152 504
    C 153 530 152 558 151 578
    C 150 588 149 596 148 604
    C 141 611 135 617 138 623
    C 148 629 168 629 181 625
    C 188 621 189 613 186 605
    C 183 595 181 587 180 578
    C 180 558 181 530 182 504
    C 184 484 186 466 187 448
    C 188 438 189 426 190 412
    C 192 392 195 370 200 358
    C 183 358 165 354 149 346
    Z
`;
