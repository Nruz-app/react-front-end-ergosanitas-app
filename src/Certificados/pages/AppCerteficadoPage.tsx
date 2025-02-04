import { CertificadoProvider } from "../context";
import CertificadoPage from "./CertificadoPage"



export const AppCertificadoPage = () => {
  return (
    <CertificadoProvider>
        <CertificadoPage />
    </CertificadoProvider>
  )
}

export default AppCertificadoPage;