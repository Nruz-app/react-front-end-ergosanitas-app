import CertificadoPage from "./CertificadoPage"


/**
 * Punto de entrada lazy de /certificados. Ya no envuelve en CertificadoProvider: el estado
 * vive en la propia página (SPEC 01 de certificados).
 */
export const AppCertificadoPage = () => {
  return (
    <CertificadoPage />
  )
}

export default AppCertificadoPage;
