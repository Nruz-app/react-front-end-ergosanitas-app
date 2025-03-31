import { Box, Card } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import citiesJson from '../config/cities-interes.json';

/**************************************************************************************  
* * Link Docks
* * - https://www.mapbox.com  
* * - https://docs.mapbox.com/help/getting-started/access-tokens/ 
* * -  https://github.com/mapbox 
* *  Comando para instalar 
* * -  npm install mapbox-gl
* * - Recuerda Importar el archivo css de map box en index.html
* * - Key MapBox -> https://docs.mapbox.com/help/getting-started/access-tokens/
*************************************************************************************/
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

export const MapBoxGlobe = () => {

  const mapContainer = useRef<HTMLDivElement>(null); 
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {

    if (mapContainer.current && !map) {

        const newMap = new mapboxgl.Map({
            container: mapContainer.current, // Contenedor donde se dibuja el mapa
            style: "mapbox://styles/mapbox/satellite-v9", // Estilo satelital
            center: [0, 10], // Centro en el ecuador
            zoom: 1.5, // Nivel de zoom
            pitch: 10, // Inclinación para 3D
            bearing: 0, // Dirección
            projection: "globe", // Proyección 3D
        });

        setMap(newMap);

        //Evendo Cargando
        newMap.on("style.load", () => {

    
            newMap.setFog({
              color: "rgb(186, 210, 235)",
              "high-color": "rgb(36, 92, 223)",
              "horizon-blend": 0.02,
              "space-color": "rgb(11, 11, 25)",
              "star-intensity": 0.6,
            });

            // Agregar puntos de interés con ciudades importantes
            citiesJson.forEach(({name,lng,lat}) => {
                new mapboxgl.Marker({ color: "gold" }) // Marcador dorado 🌟
                    .setLngLat([lng,lat])
                    .setPopup(new mapboxgl.Popup().setText(name)) // Nombre al hacer clic
                    .addTo(newMap);
            });

            // Iniciar animación de rotación
            let rotation = 0;
            const rotateGlobe = setInterval(() => {
                rotation = (rotation + 0.2) % 360; // Aumenta la rotación suavemente
                newMap.rotateTo(rotation, { duration: 100 }); // Ajusta la rotación
            }, 50); // Intervalo de actualización

            // Guardar el intervalo en el mapa para limpiarlo después
            newMap.on("remove", () => clearInterval(rotateGlobe));

        });
    }
    // Limpiar cuando el componente se desmonte
    return () => { if (map) { map.remove(); }};

  },[map]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt : 2 }}>
      <Card
        sx={{
          width: { xs: '100%', sm: '90%', md: '80%' }, 
          height: { xs: '60vh', sm: '70vh', md: '80vh' },
          borderRadius: "16px",
          boxShadow: 10,
          overflow: "hidden",
          background: "linear-gradient(135deg, #2196F3 30%, #21CBF3 90%)", // Fondo degradado
          
        }}
      >
      

        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

        
      </Card>
    </Box>
  )
}
