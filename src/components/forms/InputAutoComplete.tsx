import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

/********************************************************************************
* * Link 
* * - https://api.countrystatecity.in/v1/countries/CL/states/RM/cities
* * key 
* * - name => X-CSCAPI-KEY
* * - value => MXZaaVR0MTA2QlUyNktuR0RjdUQ1a29MQ1BjWTdXYUJlc3huY29aMw==
**********************************************************************************/


import comunasJson  from '../../AgendarHora/config/comunas.json';

interface Comunas {
    id : number;
    latitude : string;
    longitude : string;
    name : string;
}

interface Props {
    control       : any;
    type          : string;
    name          : string;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    validations?  : any;
    values        : [];         
}


export const InputAutoComplete = ( { control,...props } : Props ) => {
  return (
    <Controller
        name= { props.name }
        control={ control }
        rules={{ required: true }}
        defaultValue = { comunasJson.comunas }
        render={({
            field: { onChange, value, ref, ...field },
            fieldState: { error },
        }) => (
            <Autocomplete
                {...field}
                value={ comunasJson.comunas.find(( comunas ) => comunas.name === value) || null}
                options={ comunasJson.comunas }
                getOptionLabel={ ( option ) => `${ option.name }`}
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
            onChange={(event, newValue: Comunas | null) => {
                event.preventDefault();
                onChange(newValue?.name??'')
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
