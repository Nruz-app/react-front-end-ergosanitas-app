import { AgendaHoraPage } from "./AgendarHora";
import { AgendarHoraTable } from '../components/';
import { useContext } from "react";
import { LoginContext } from "../../common/context";

export const AppAgendarHoraPage = () => {

  const { valid }  = useContext( LoginContext );

  return (
    
    (!valid) ? 
        ( <AgendaHoraPage /> ) 
    :
        ( <AgendarHoraTable /> )
      
  )
}

export default AppAgendarHoraPage;