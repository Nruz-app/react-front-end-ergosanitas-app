import {
  Routes,
  Route,
} from "react-router-dom";

import { AppElectrocardiogramaPage } from "../SEO";
import { ServiciosMain } from "../components";

const AppServiciosPage = () => {

  return (

    <Routes>

      {/* Página principal de servicios */}
      <Route
        path="/"
        element={<ServiciosMain />}
      />

      {/* Página SEO */}
      <Route
        path="electrocardiograma"
        element={<AppElectrocardiogramaPage />}
      />

    </Routes>

  );
}

export default AppServiciosPage;