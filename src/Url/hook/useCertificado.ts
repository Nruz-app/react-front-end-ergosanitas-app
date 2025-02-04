
/******************************************* 
* * * Link
* * - https://www.npmjs.com/package/react-hook-form
* * - https://www.npmjs.com/package/@hookform/resolvers
* * Instalar 
* * - npm i react-hook-form
* * - npm i @hookform/resolvers
**********************************************/
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { ICertificado } from '../interface/ICertificado';

import { certificadoValidationSchema } from '../utilities/certificado-validation.utility';
import { useEffect } from 'react';

const useCertificado = (agendaHora?: ICertificado) => {

    const {control,reset,handleSubmit,formState: { errors },} = useForm({
        resolver: yupResolver<ICertificado | any>(certificadoValidationSchema),
        context: { agendaHora },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(agendaHora);
      
      }, [agendaHora, reset]);
  
      return { control, reset, handleSubmit, errors };
}

export default useCertificado;