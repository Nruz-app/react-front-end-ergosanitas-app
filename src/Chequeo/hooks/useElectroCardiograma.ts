
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


import { IElectroCardiograma } from '../interface/';

import { electroCardiogramaValidationSchema } from '../utilities';
import { useEffect } from 'react';


const useElectroCardiograma = (electroCardiograma?: IElectroCardiograma) => {

    const {control,reset,handleSubmit,setValue,formState: { errors },} = useForm({
        resolver: yupResolver<IElectroCardiograma | any>(electroCardiogramaValidationSchema),
        context: { electroCardiograma },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(electroCardiograma);
      
      }, [electroCardiograma, reset]);
  
      return { control, reset, handleSubmit,setValue, errors };
}

export default useElectroCardiograma;