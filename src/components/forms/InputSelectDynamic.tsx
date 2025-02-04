import { MenuItem, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

interface PropsSelect {
    nombre: string;
    id: number;
}


interface Props {
    control        : any;
    type           : string;
    name           : string;
    placeholder    : string;
    label          : string;
    defaultValue?  : string;
    helperText?    : string;
    validations?   : any;
    values         : PropsSelect[];   
    handleDowload? : () => void;      
}

export const InputSelectDynamic = ( { control,handleDowload,...props } : Props ) => {


    const handleClick = async() => {

        handleDowload!();

    }  


    return (
        <Controller
        name={props.name}
        defaultValue={props.defaultValue}
        rules={{ required: true }}
        control={control}
        render={({
            field: { onChange, ref, ...field },
            fieldState: { error },
        }) => (
            <TextField
                id = { props.name }
                {...field}
                inputRef={ref}
                onChange={(e) => {
                    onChange(e); // Llamas a la función onChange de React Hook Form
                    handleClick(); // Llamas a tu función handleClick
                }}
                error={!!error}
                fullWidth
                label={props.label}
                select
                helperText={error ? error.message : props.helperText}
                placeholder={props.placeholder}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f9f9f9",
                        "&.Mui-focused fieldset": {
                            borderColor: "#3f51b5",
                        },
                        "&:hover fieldset": {
                            borderColor: "#3f51b5",
                        },
                    },
                    "& .MuiFormHelperText-root": {
                        color: error ? "#f44336" : "#8c8c8c",
                        fontStyle: error ? "italic" : "normal",
                    },
                }}
            >
                {props.values.map(({ nombre, id }) => (
                    <MenuItem 
                        key={ id } 
                        value={ nombre }
                        sx={{
                            "&.Mui-selected": {
                                backgroundColor: "#3f51b5",
                                color: "#fff",
                            },
                            "&.Mui-selected:hover": {
                                backgroundColor: "#303f9f",
                            },
                            "&:hover": {
                                backgroundColor: "#f1f1f1",
                            },
                        }}
                    >
                        { nombre }
                    </MenuItem>
                ))}
            </TextField>
        )}
    /> 
  )
}
