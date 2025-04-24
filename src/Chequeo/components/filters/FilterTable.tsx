
import { Box } from "@mui/material";

import { LikeTextCheque } from "../LikeTextCheque";
import { DatePickerInput } from '../';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LoginContext } from '../../../common/context';
import { SelectClub } from '../select-club/select-club';

import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useContext } from "react";

export const FilterTable = () => {

    const { user }  = useContext( LoginContext );
    const { user_perfil }  = user;
    
    let isInvisible = true
    if(user_perfil == "Administrador")
        isInvisible = false;  
   
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 800,
                mx: "auto",
                bgcolor: "background.paper",
                boxShadow: 4,
                borderRadius: 3,
                overflow: "hidden",
                p: 2,
            }}
            >
            {/************* Filter Texto ********************************** */ }    
            <Accordion
                disableGutters
                defaultExpanded={true}
                elevation={1}
                square
                sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                transition: "box-shadow 0.3s ease-in-out",
                '&:hover': {
                    boxShadow: "0 6px 30px rgba(0, 0, 0, 0.15)",
                },
                }}
            >
                <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                    background: "linear-gradient(90deg, #66bb6a, #81c784)",
                    color: "#fff",
                    borderRadius: 3,
                    px: 3,
                    typography: 'h6',
                    '&:hover': {
                        background: "linear-gradient(90deg, #4caf50, #66bb6a)",
                    },
                    transition: "background 0.3s ease-in-out",
                }}
                >
                Filtrar Rut y/o Nombre
                </AccordionSummary>
                <AccordionDetails
                sx={{
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    p: 3,
                    animation: "fadeIn 0.5s ease-in-out",
                }}
                >
                <LikeTextCheque />
                </AccordionDetails>
            </Accordion>
            {/********************* Filter Calendar *********************************** */ }
            <Accordion
                disableGutters
                elevation={0}
                square
                sx={{
                    mt:1,    
                    display: isInvisible ? "none" : "block",    
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "box-shadow 0.3s ease-in-out",
                    '&:hover': {
                        boxShadow: "0 6px 30px rgba(0, 0, 0, 0.15)",
                    },
                }}
            >
                <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                aria-controls="panel2-content"
                id="panel2-header"
                sx={{
                    background: "linear-gradient(90deg, #66bb6a, #81c784)",
                    color: "#fff",
                    borderRadius: 3,
                    px: 3,
                    typography: 'h6',
                    '&:hover': {
                        background: "linear-gradient(90deg, #4caf50, #66bb6a)",
                    },
                    transition: "background 0.3s ease-in-out",
                }}
                >
                Filtrar Fecha
                </AccordionSummary>
                <AccordionDetails
                sx={{
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    p: 3,
                    animation: "fadeIn 0.5s ease-in-out",
                }}
                >
                    <DatePickerInput />
                </AccordionDetails>
            </Accordion>
            {/********************* Filtrar Club *********************************** */ }
            <Accordion
                disableGutters
                elevation={0}
                square
                sx={{
                    mt:1,
                    display: isInvisible ? "none" : "block",    
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "box-shadow 0.3s ease-in-out",
                    '&:hover': {
                        boxShadow: "0 6px 30px rgba(0, 0, 0, 0.15)",
                    },
                }}
            >
                <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                aria-controls="panel3-content"
                id="panel3-header"
                sx={{
                    background: "linear-gradient(90deg, #66bb6a, #81c784)",
                    color: "#fff",
                    borderRadius: 3,
                    px: 3,
                    typography: 'h6',
                    '&:hover': {
                        background: "linear-gradient(90deg, #4caf50, #66bb6a)",
                    },
                    transition: "background 0.3s ease-in-out",
                }}
                >
                Filtrar Club
                </AccordionSummary>
                <AccordionDetails
                sx={{
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    p: 3,
                    animation: "fadeIn 0.5s ease-in-out",
                }}
                >
                    <SelectClub />
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}
