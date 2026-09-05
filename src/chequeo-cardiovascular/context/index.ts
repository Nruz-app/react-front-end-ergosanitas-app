// El barril de `src/Chequeo/context/` solo exportaba `like-text`, así que `ModalBarProvider`
// se importaba por ruta directa. Aquí se exportan los dos.
export { LikeTextContext } from './like-text/LikeTextContext';
export { LikeTextProvider } from './like-text/LikeTextProvider';
export { LikeTextReducer } from './like-text/likeTextReducer';
export type { LikeTextState } from './like-text/LikeTextProvider';
export type { LikeTextContextProps } from './like-text/LikeTextContext';

export { ModalBarContext } from './modal-bar/ModalBarContext';
export { ModalBarProvider } from './modal-bar/ModalBarProvider';
export { ModalBarReducer } from './modal-bar/modalBarReducer';
export type { ModalState } from './modal-bar/ModalBarProvider';
export type { ModalBarContextProps } from './modal-bar/ModalBarContext';
