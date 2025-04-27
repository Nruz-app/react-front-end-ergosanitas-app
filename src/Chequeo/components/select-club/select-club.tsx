import { useContext, useEffect, useState } from "react";
import { Box, MenuItem, Paper, Select,FormControl, InputLabel, SelectChangeEvent } from "@mui/material"
import { UseRegister } from "../../../Login/services/useRegister";
import { IUser } from "../../../Login/interface";
import { LikeTextContext } from "../../context";
const initialSelectValue : IUser[] = []



export const SelectClub = () => {

    const { onSetLikeText,...likeTextContext }  = useContext( LikeTextContext );
    const [selectValue,setSelectValue] = useState<IUser[]>(initialSelectValue);
    const [selectStatus,setSelectStatus] = useState(false);
    
    const loadDataClub = async () => {
        setSelectStatus(false);
        const { getUserEmail } = await UseRegister();
                  
        const rowUserEmail = await getUserEmail();

        setSelectValue(rowUserEmail);
        setSelectStatus(true);
        
    } 

    useEffect(() => {      
        loadDataClub();
    }, [])


    const onchangerDataClub = async ( e : SelectChangeEvent<string>) => {
        e.preventDefault()
        const selectedValue = e.target.value;

        if(!selectedValue) return;

        try {
            const newLikeTextState = {...likeTextContext, selectClub : selectedValue}
            onSetLikeText(newLikeTextState);
        } catch (error) {
            console.error("Error al obtener los chequeos:", error);
        }
    }

  return (
    <Box
      mb={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          p: 3, // Mejor espaciado dentro del Paper
          display: 'flex',
          alignItems: 'center',
          width: '80%',
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Sombra más profunda
          borderRadius: '12px', // Bordes ligeramente más redondeados
          border: '1px solid #e0e0e0', // Borde suave
        }}
      >
        {
          (selectValue.length > 0) &&
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="id-club-deportivo-label">Selecciona un Club</InputLabel>
            <Select
              labelId="id-club-deportivo-label"
              id="id-club-deportivo"
              label="Selecciona un Club"
              value={ '' } 
              onChange={onchangerDataClub}
              sx={{
                borderRadius: '8px', // Bordes redondeados
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc', // Borde de entrada
                  },
                  '&:hover fieldset': {
                    borderColor: '#51d1f6', // Borde al pasar el mouse
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#51d1f6', // Borde al tener foco
                  },
                },
              }}
            >
            <MenuItem value="" sx={{ color: "#999" }}>
              <em>Selecciona un Club</em>
            </MenuItem>
            {
              selectStatus &&
              selectValue.map((user, index) => (
                <MenuItem
                  key={index}
                  value={user.user_email}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#51d1f6',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#51d1f6',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#f1f1f1',
                    },
                  }}
                >
                  { user.user_name  }
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
      }
      </Paper>
    </Box>
  )
}
