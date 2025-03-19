
import { useChequeoRut } from '../hooks';
import { IChequeo } from "../interface";
import { ChequeoForm } from "./ChequeoForm";


interface Props {
    rut_paciente : string;
    id_paciente : number;
    handleUpdateStatus : (status : number, rut_paciente : string,id_paciente : number) => void;
}


export const ChequeoFormUpdate = ({id_paciente,handleUpdateStatus}: Props) => {
  
 const { chequeo }: { 
    chequeo: IChequeo | undefined;
    setChequeo: React.Dispatch<React.SetStateAction<IChequeo | undefined>>;
  } = useChequeoRut(id_paciente);  

  
  return (
    <ChequeoForm
        chequeo = { chequeo } 
        handleUpdateStatus = { handleUpdateStatus }
    />
  )
}
