import { Box, MenuItem, Paper, Select,FormControl, InputLabel, SelectChangeEvent } from "@mui/material"
import { useEffect, useState } from "react";
import { UseChequeoService } from "../../services/useChequeoService";
import { IChequeo } from "../../interface";
import { UseRegister } from "../../../Login/services/useRegister";
import { IUser } from "../../../Login/interface";

const initialSelectValue : IUser[] = []

interface Props {
    setRowTable  : (chequeo:IChequeo[]) => void;
}


export const SelectClub = ({setRowTable}: Props) => {

    const [selectValue,setSelectValue] = useState<IUser[]>(initialSelectValue);
    
    const loadDataClub = async () => {
        const { getUserEmail } = await UseRegister();
                  
        const rowUserEmail = await getUserEmail();

        setSelectValue(rowUserEmail);

    } 

    useEffect(() => {      
        loadDataClub();
    }, [])


    const onchangerDataClub = async ( e : SelectChangeEvent<string>) => {
        e.preventDefault()
        const selectedValue = e.target.value;

        if(!selectedValue) return;

        try {
            const { postFilterClubDeportivo } = await UseChequeoService();
            const responseChequeos = await postFilterClubDeportivo(selectedValue);
            setRowTable(responseChequeos);
          
        } catch (error) {
            console.error("Error al obtener los chequeos:", error);
        }
    }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel id="id-club-deportivo-label">Selecciona un Club</InputLabel>
          <Select
            labelId="id-club-deportivo-label"
            id="id-club-deportivo"
            label="Selecciona un Club"
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
      </Paper>
    </Box>
  )
}
