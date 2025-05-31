/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuItem, TextField } from "@mui/material";
import { Controller, UseFormSetValue } from "react-hook-form";
import { IUser } from "../../../Login/interface";
import { useEffect, useState } from "react";
import { UseRegister } from "../../../Login/services/useRegister";

interface PropsSelect {
    value: string;
    nombre: string;
}

const initialSelectValue : IUser[] = [];


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

export const SelectUser = ( { control,...props } : Props ) => {

    const [selectValue,setSelectValue] = useState<IUser[]>(initialSelectValue);

    const loadDataClub = async () => {
        const { getUserEmail } = await UseRegister();
                    
        const rowUserEmail = await getUserEmail(3);

        setSelectValue(rowUserEmail);
    
    } 
    
    useEffect(() => {      
        loadDataClub();
    }, [])

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
                //disabled={props.disabled}
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
                {selectValue.map(({ user_email, user_name }) => (
                    <MenuItem 
                        key={user_email} 
                        value={user_email}
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
                        { user_name }
                    </MenuItem>
                ))}
            </TextField>
        )}
    /> 
  )
}
