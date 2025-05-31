
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

import { IIncidentes } from '../interface/incidentes.interface';

import { incidentesValidationSchema } from '../utilities/incidentes-validation.utility';
import { useEffect } from 'react';

const useFormIncidentes = (incidentes?: IIncidentes) => {

    const {control,reset,handleSubmit,setValue,formState: { errors },} = useForm({
        resolver: yupResolver<IIncidentes | any>(incidentesValidationSchema),
        context: { incidentes },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(incidentes);
      
      }, [incidentes, reset]);
  
      return { control, reset, handleSubmit,setValue, errors };
}

export default useFormIncidentes;