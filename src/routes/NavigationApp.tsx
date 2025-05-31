
import { Navigation }  from './Navigation';
import { NavigationErgo }  from './NavigationErgo';
import { NavigationED }  from './NavigationED';

import { LoginContext } from '../common/context/';
import { useContext } from 'react';

export const NavigationApp = () => {

  const { valid,user }  = useContext( LoginContext );
  
  console.log('NavigationApp valid:', valid, 'user:', user);

  return (
    
    (!valid) ? 
        ( <Navigation /> ) 
    :
    ( valid && user.user_perfil == "Emergencia Deportiva" ) ?
      ( <NavigationED /> )
    :
      ( <NavigationErgo /> )
      
  )
}
