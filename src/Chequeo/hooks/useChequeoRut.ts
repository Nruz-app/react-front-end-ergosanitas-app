import { useEffect, useState } from 'react';
import { IChequeo } from '../interface';
import { UseChequeoService } from '../services/useChequeoService';

interface Props {
    chequeo: IChequeo | undefined;
    setChequeo: React.Dispatch<React.SetStateAction<IChequeo | undefined>>;
}

const useChequeoRut = (rut_paciente: string) : Props => {

   
    const [chequeo, setChequeo]: [
        IChequeo | undefined,
        React.Dispatch<React.SetStateAction<IChequeo | undefined>>,
    ] = useState<IChequeo>();
    

    const loadChequeo = async (rut_paciente: string) => {
        
        const {  getChequeoRut } = await UseChequeoService() ;
        const resChequeo:IChequeo = await getChequeoRut(rut_paciente);
        setChequeo(resChequeo);
    };


    useEffect(() => {

        if (rut_paciente) loadChequeo(rut_paciente);
    
    }, [rut_paciente]);

    return { chequeo,setChequeo };
    
}

export default useChequeoRut;