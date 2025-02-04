
import { useChequeoRut } from '../hooks';
import { IChequeo } from "../interface";
import { ChequeoForm } from "./ChequeoForm";


interface Props {
    rut_paciente : string;
    handleUpdateStatus : (status : number, rut_paciente : string) => void;
}


export const ChequeoFormUpdate = ({rut_paciente,handleUpdateStatus}: Props) => {
  
 const { chequeo }: { 
    chequeo: IChequeo | undefined;
    setChequeo: React.Dispatch<React.SetStateAction<IChequeo | undefined>>;
  } = useChequeoRut(rut_paciente);  

  
  return (
    <ChequeoForm
        chequeo = { chequeo } 
        handleUpdateStatus = { handleUpdateStatus }
    />
  )
}
