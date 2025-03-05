
import { CalculadoraIMC } from '../interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { calculadoraIMCValidationSchema } from '../utilities';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const useFormCalculoIMC = (calculadoraIMC? : CalculadoraIMC) => {

    const {control,reset,handleSubmit,setValue,formState: { errors },} = useForm({
        resolver: yupResolver<CalculadoraIMC | any>(calculadoraIMCValidationSchema),
        context: { calculadoraIMC },
        mode: "all",
        criteriaMode: "all",
    });

    useEffect(() => {
    
        reset(calculadoraIMC);
    
    }, [calculadoraIMC, reset]);
      

    return { control, reset, handleSubmit,setValue, errors };

}
export default useFormCalculoIMC;