import {
    IconButton,
    InputAdornment,
    TextField
} from "@mui/material";

import ClearIcon
from "@mui/icons-material/Clear";

interface Props {
    label: string;
    value: string;
    onClear?: () => void;
}

export const CampoChequeo = ({label,value,onClear}: Props) => {

    return (
        <TextField
            label={label}
            value={value}
            fullWidth
            InputLabelProps={{
                shrink: true
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment
                        position="end"
                    >
                        <IconButton
                            onClick={onClear}
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}