import { yupResolver } from "@hookform/resolvers/yup";
import { IUser } from "../interface";
import { useForm } from "react-hook-form";

import { userValidationSchema } from '../utilities/user.utility';
import { useEffect } from "react";


const useUser = (user?: IUser) => {

    const {control,reset,handleSubmit,formState: { errors },} = useForm({
        resolver: yupResolver<IUser | any>(userValidationSchema),
        context: { user },
        mode: "all",
        criteriaMode: "all",
      });

      useEffect(() => {

        reset(user);
      
      }, [user, reset]);
  
      return { control, reset, handleSubmit, errors };

}

export default useUser;