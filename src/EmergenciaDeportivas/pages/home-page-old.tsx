import { useCallback, useContext, useEffect, useState } from "react";
import { EmergencyFlowStepper, ListIncidenciasDeportivas,IncidentesRecientes } from '../'
import { Grid } from "@mui/material";

import { LoginContext } from "../../common/context";
import { UseIncidentesService } from "../../Incidentes";
import { IIncidentes } from "../../Incidentes/interface/incidentes.interface";
import React from "react";

const rows_servicios:IIncidentes[] = [];

export const HomePage_OLD = () => {

  const { user }  = useContext( LoginContext );
  const [incidentesRow, incidentesRowSet] = useState(rows_servicios);

   const fetchServicios = useCallback(async (): Promise<void> => {
     
        const {  getIncidentesFindByUser } = await UseIncidentesService() ;
        const responseIncidentes = await getIncidentesFindByUser(user.user_email);
        incidentesRowSet(responseIncidentes);   
   
     },[incidentesRowSet]);


   useEffect(() => {
       fetchServicios();
   }, []);


    return (
      <Grid container spacing={2}>
        {/* Primera Fila */}
        <Grid item xs={12} sm={4} md={4} >
          <EmergencyFlowStepper />
        </Grid>

        {/* Segunda Fila */}
        <Grid item xs={12} sm={8} md={8}>
          <ListIncidenciasDeportivas />
        </Grid>
        {
          incidentesRow.map((incidente: IIncidentes, index: number) => (
            <React.Fragment key={index}>
              
              {/* Tercera Fila */}
              <Grid item xs={12}>
                <IncidentesRecientes incidentes={incidente} />
              </Grid>
            </React.Fragment>
          ))
        }
      </Grid>
  )
   

}

export default HomePage_OLD;