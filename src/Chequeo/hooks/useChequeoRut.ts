import { useEffect, useState } from 'react';
import { IChequeo } from '../interface';
import { UseChequeoService } from '../services/useChequeoService';

interface Props {
    chequeo: IChequeo | undefined;
    setChequeo: React.Dispatch<React.SetStateAction<IChequeo | undefined>>;
}

const useChequeoRut = (id_paciente: number) : Props => {

   
    const [chequeo, setChequeo]: [
        IChequeo | undefined,
        React.Dispatch<React.SetStateAction<IChequeo | undefined>>,
    ] = useState<IChequeo>();
    

    const loadChequeo = async (id_paciente: number) => {
        
        const {  getChequeoRut } = await UseChequeoService() ;
        const resChequeo:IChequeo = await getChequeoRut(id_paciente);
        setChequeo(resChequeo);
    };


    useEffect(() => {

        if (id_paciente) loadChequeo(id_paciente);
    
    }, [id_paciente]);

    return { chequeo,setChequeo };
    
}

export default useChequeoRut;