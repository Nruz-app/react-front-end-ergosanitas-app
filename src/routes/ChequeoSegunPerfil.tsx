import { useContext } from 'react';

import { LoginContext } from '../common/context';
import { AppChequeo } from '../Chequeo/pages';
import { AppChequeoAdministrador } from '../chequeo-administrador/pages';

/**
 * Entrada `/Chequeos/*` de `routesErgo` (Spec 01 de `chequeo-administrador`, §5).
 *
 * El perfil `Administrador` ve el módulo nuevo; cualquier otro perfil que llegue por
 * `NavigationErgo` (en la práctica `Usuario`) sigue en `AppChequeo`, sin cambios. Se decide aquí
 * y no con una segunda ruta porque `validatePerfil` le muestra **todo** al Administrador: con dos
 * entradas vería dos botones «Chequeos».
 *
 * Los dos componentes son `lazy`; el `Suspense` de `NavigationErgo` ya los cubre.
 * El `trim()` replica el de `NavigationApp`: `user_perfil` es un string libre del backend.
 *
 * Vía de reversa: volver a `Component: AppChequeo` en `routesErgo.ts`.
 */
export const ChequeoSegunPerfil = () => {

    const { user } = useContext(LoginContext);

    return user.user_perfil?.trim() === 'Administrador'
        ? <AppChequeoAdministrador />
        : <AppChequeo />;
};
