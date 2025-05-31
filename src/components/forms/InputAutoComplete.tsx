import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";


import { IUser } from "../../Login/interface";
import { useEffect, useState } from "react";
import { UseRegister } from "../../Login/services/useRegister";

const initialSelectValue : IUser[] = [];
interface Props {
    control       : any;
    type          : string;
    name          : string;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    validations?  : any;
    perfil       : number; 
    values        : [];         
}


export const InputAutoComplete = ( { control,perfil = 3,...props } : Props ) => {

    const [selectValue,setSelectValue] = useState<IUser[]>(initialSelectValue);
    const [selectStatus,setSelectStatus] = useState(false);

    const loadDataClub = async () => {
        setSelectStatus(false);
        const { getUserEmail } = await UseRegister();
        const rowUserEmail = await getUserEmail(perfil);
        setSelectValue(rowUserEmail);
        setSelectStatus(true);
    } 

    useEffect(() => {      
        loadDataClub();
    }, [])



  return (
    selectStatus && 
    <Controller
        name= { props.name }
        control={ control }
        rules={{ required: true }}
        defaultValue = { selectValue }
        render={({
            field: { onChange, value, ref, ...field },
            fieldState: { error },
        }) => (
            <Autocomplete
                {...field}
                value={ selectValue.find(( {user_email} ) => user_email === value) || null}
                options={ selectValue }
                getOptionLabel={ ( option ) => `${ option.user_name }`}
                loading={ true }
                loadingText="Cargando..."
                renderInput={( params ) => (
                <TextField
                    {...params}
                    error={!!error}
                    helperText={error ? error.message : props.helperText}
                    placeholder={props.placeholder}
                    fullWidth
                    inputRef={ref}
                    ref={ref}
                    value={value}
                    label={props.label}
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f9f9f9",
                            borderRadius: 2,
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
                />
            )}
            onChange={(event, newValue: IUser | null) => {
                event.preventDefault();
                onChange(newValue?.user_email??'')
            }}
            sx={{
                "& .MuiAutocomplete-inputRoot": {
                    padding: "6px",
                },
                "& .MuiAutocomplete-popupIndicator": {
                    color: "#3f51b5",
                },
                "& .MuiAutocomplete-clearIndicator": {
                    color: "#f44336",
                },
            }}
            />
        )}
    />
  )
}
