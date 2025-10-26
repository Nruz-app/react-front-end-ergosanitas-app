import { useContext } from 'react';
import { Navigation } from './Navigation';
import { NavigationErgo } from './NavigationErgo';
import { NavigationED } from './NavigationED';
import { NavigationPA } from './NavigationPA';
import { LoginContext } from '../common/context/';

export const NavigationApp = () => {
  const { valid, user } = useContext(LoginContext);
  const perfil = user.user_perfil?.trim();

  switch (perfil) {
    case 'Emergencia Deportiva':
      return <NavigationED />;
    case 'Paciente':
      return <NavigationPA />;
    default:
      return valid ? <NavigationErgo /> : <Navigation />;
  }
};
