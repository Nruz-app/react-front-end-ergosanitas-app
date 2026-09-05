// Barril completo: todo lo público del contexto sale de aquí, sin rutas directas al archivo
// hondo. En `src/Chequeo/context/` el barril solo exportaba `like-text` y `ModalBarProvider`
// había que importarlo a mano.
//
// Desde la Spec 03 solo queda `like-text/`: `modal-bar/` se retiró junto con `ModalStatus` y el
// botón «Detalle clínico», que eran sus dos únicos consumidores.
export { LikeTextContext } from './like-text/LikeTextContext';
export { LikeTextProvider } from './like-text/LikeTextProvider';
export { LikeTextReducer } from './like-text/likeTextReducer';
export type { LikeTextState } from './like-text/LikeTextProvider';
export type { LikeTextContextProps } from './like-text/LikeTextContext';
