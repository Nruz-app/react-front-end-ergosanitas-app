
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from "@mui/material";

import { LikeTextCheque } from "../LikeTextCheque";
import { useContext, useState } from 'react';

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { LoginContext } from '../../../common/context';
import { SelectClub } from '../select-club/select-club';

export const FilterTableTab = () => {

    const { user }  = useContext( LoginContext );
    const { user_perfil }  = user;
    
    let isInvisible = true
    if(user_perfil == "Administrador")
        isInvisible = false;  
   
 
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        event.preventDefault();
        setValue(newValue);
    };
 
    return (
    <Box
        sx={{
            width: "100%",
            maxWidth: 600,
            mx: "auto",
            mt: 2,
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            overflow: "hidden",
        }}
    >
        <Tabs
            value={value}
            onChange={handleChange}
            aria-label="icon position tabs example"
            variant="fullWidth"
            sx={{
                "& .MuiTabs-indicator": {
                    backgroundColor: "#1976D2", // Color del indicador
                },
            }}
        >
            <Tab
                icon={<ManageSearchIcon />}
                label="Buscador"
                iconPosition="start"
                sx={{
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: value === 0 ? "#1976D2" : "gray",
                    transition: "0.3s",
                    "&:hover": { color: "#1976D2" },
                }}
            />
            <Tab
                icon={<DateRangeIcon />}
                label="Calendario"
                iconPosition="start"
                
                sx={{
                    visibility: isInvisible ? "hidden" : "visible",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: value === 1 ? "#1976D2" : "gray",
                    transition: "0.3s",
                    "&:hover": { color: "#1976D2" },
                }}
            />
            <Tab
                icon={<DateRangeIcon />}
                label="Club Deportivos"
                iconPosition="start"
                
                sx={{
                    visibility: isInvisible ? "hidden" : "visible",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: value === 2 ? "#1976D2" : "gray",
                    transition: "0.3s",
                    "&:hover": { color: "#1976D2" },
                }}
            />
        </Tabs>

        <Box sx={{ p: 2 }}>
            {value === 0 && <LikeTextCheque  /> }
            {value === 2 && <SelectClub  />}
        </Box>
    </Box>
    )
}
