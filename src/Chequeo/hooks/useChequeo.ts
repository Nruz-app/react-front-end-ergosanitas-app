
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

import { IChequeo } from '../interface';

import { chequeoValidationSchema } from '../utilities';
import { useEffect } from 'react';

const useChequeo = (chequeo?: IChequeo) => {

    const {control,reset,handleSubmit,setValue,formState: { errors },} = useForm({
        resolver: yupResolver<IChequeo | any>(chequeoValidationSchema),
        context: { chequeo },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(chequeo);
      
      }, [chequeo, reset]);
  
      return { control, reset, handleSubmit,setValue, errors };
}

export default useChequeo;