import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { IUser } from "../../Login/interface";
import { UseRegister } from "../../Login/services/useRegister";

const initialSelectValue: IUser[] = [];

interface Props {
    label?: string;
    placeholder?: string;
    helperText?: string;
    perfil?: number;
    value?: string;
    onChange?: (value: string, item: IUser | null) => void;
}

export const SelectClub = ({
    perfil = 3,
    label = "Club",
    placeholder = "Seleccione un club",
    helperText,
    value,
    onChange,
}: Props) => {

    const [selectValue, setSelectValue] = useState<IUser[]>(initialSelectValue);
    const [loading, setLoading] = useState(true);

    const loadDataClub = async () => {
        setLoading(true);

        const { getUserEmail } = await UseRegister();
        const rowUserEmail = await getUserEmail(perfil);

        setSelectValue(rowUserEmail);
        setLoading(false);
    };

    useEffect(() => {
        loadDataClub();
    }, []);

    return (
        <Autocomplete
            value={
                selectValue.find(({ user_email }) => user_email === value) || null
            }
            options={selectValue}
            getOptionLabel={(option) => option.user_name}
            loading={loading}
            loadingText="Cargando..."
            onChange={(_, newValue: IUser | null) => {
                onChange?.(newValue?.user_email ?? "", newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    helperText={helperText}
                    fullWidth
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
                    }}
                />
            )}
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
    );
}