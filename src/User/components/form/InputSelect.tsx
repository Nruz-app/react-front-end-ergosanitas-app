/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuItem, TextField } from "@mui/material";
import { Controller, UseFormSetValue } from "react-hook-form";

interface PropsSelect {
    value: string;
    nombre: string;
}


interface Props {
    control       : any;
    type          : string;
    name          : string;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    disabled      : boolean;  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validations?  : any;
    values        : PropsSelect[];    
    setValue      : UseFormSetValue<any>;     
}

export const InputSelect = ( { control,setValue,...props } : Props ) => {

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
                //onChange={onChange}
                onChange={(event) => {
                    onChange(event);
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
                    display: props.disabled ? 'none' : 'block',
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
                {props.values.map(({ nombre, value }) => (
                    <MenuItem 
                        key={value} 
                        value={value}
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
