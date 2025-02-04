
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

import { IAgendaHora } from '../interface/';

import { agendaHoraValidationSchema } from '../utilities/agenda-hora-validation.utility';
import { useEffect } from 'react';

const useAgendaHora = (agendaHora?: IAgendaHora) => {

    const {control,reset,handleSubmit,formState: { errors },} = useForm({
        resolver: yupResolver<IAgendaHora | any>(agendaHoraValidationSchema),
        context: { agendaHora },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(agendaHora);
      
      }, [agendaHora, reset]);
  
      return { control, reset, handleSubmit, errors };
}

export default useAgendaHora;