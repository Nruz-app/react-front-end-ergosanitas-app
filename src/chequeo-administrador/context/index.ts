// Barril completo (§7.1): todo lo público del contexto sale de aquí. En `src/Chequeo/context/`
// el barril dejaba fuera parte de lo que había en la carpeta.
export { LikeTextContext } from './like-text/LikeTextContext';
export { LikeTextProvider } from './like-text/LikeTextProvider';
export { LikeTextReducer } from './like-text/likeTextReducer';
export type { LikeTextState } from './like-text/LikeTextProvider';
export type { LikeTextContextProps } from './like-text/LikeTextContext';
