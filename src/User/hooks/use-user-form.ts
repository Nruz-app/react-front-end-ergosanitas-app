
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

import { Iuser } from '..';

import { userValidationSchema } from '..';
import { useEffect } from 'react';

const UseUserForm = (user?: Iuser) => {

    const {control,reset,handleSubmit,setValue,formState: { errors },} = useForm({
        resolver: yupResolver<Iuser | any>(userValidationSchema),
        context: { user },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(user);
      
      }, [user, reset]);
  
      return { control, reset, handleSubmit,setValue, errors };
}

export default UseUserForm;