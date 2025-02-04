
import { Navigation }  from './Navigation';
import { NavigationErgo }  from './NavigationErgo';

import { LoginContext } from '../common/context/';
import { useContext } from 'react';

export const NavigationApp = () => {

  const { valid }  = useContext( LoginContext );
  
  return (
    
    (!valid) ? 
        ( <Navigation /> ) 
    :
        ( <NavigationErgo /> )
      
  )
}
