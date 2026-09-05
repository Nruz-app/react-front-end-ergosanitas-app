import { useContext } from 'react';
import { Navigation } from './Navigation';
import { NavigationErgo } from './NavigationErgo';
import { NavigationED } from './NavigationED';
import { NavigationPA } from './NavigationPA';
import { NavigationMe} from './NavigationMe';
import { NavigationCol } from './NavigationCol';
import { LoginContext } from '../common/context/';

export const NavigationApp = () => {
  const { valid, user } = useContext(LoginContext);
  const perfil = user.user_perfil?.trim();
  
  switch (perfil) {
    case 'Emergencia Deportiva':
      return <NavigationED />;
    case 'Paciente':
      return <NavigationPA />;
    case 'Medicos':
      return <NavigationMe />;
    // `Colegios` sale de NavigationErgo y pasa a su propio navegador, con el módulo
    // `chequeo-cardiovascular`. Los demás perfiles siguen con `src/Chequeo/` sin cambios.
    case 'Colegios':
      return <NavigationCol />;
    default:
      return valid ? <NavigationErgo /> : <Navigation />;
  }
};
