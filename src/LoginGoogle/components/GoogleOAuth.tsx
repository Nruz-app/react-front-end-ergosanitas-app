
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { UseLoginGoogleService } from "../services/UseLoginGoogleService";
import { useContext } from "react";
import { LoginContext, ModalContext } from "../../common/context";
import { IAuth } from "../interface/auth.interface";

import { setLocalStorage } from "../../common/services/local-storage/storage.service";

const GoogleOAuth =  ()  => {

  const { ValidLogin }  = useContext( LoginContext );
  const { onOpenModal }  = useContext( ModalContext );

  const  cliend_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider 
        clientId={ cliend_id }>

      

            <GoogleLogin
                useOneTap
                onSuccess={async (credentialResponse) => {
                    
                  try {

                    if (credentialResponse.credential) {

                      const {  postAuthLogin } = await UseLoginGoogleService();
                    
                      const  respose:IAuth = await postAuthLogin(credentialResponse.credential);

                      onOpenModal(false);
                      
                      if(respose.user.email) {
                        
                          setLocalStorage("AuthRegister", {...respose, token: credentialResponse.credential});
                          ValidLogin (true,{
                            user_id        : 0,
                            user_email     : '',
                            user_name      : '',
                            user_perfil    : ''
                          });
                          
                      }
                      else {
                          ValidLogin (false,{
                            user_id        : 0,
                            user_email     : '',
                            user_name      : '',
                            user_perfil    : ''
                          });
                      }
                      
                    }
                    else {
                      console.log('Error Auth');
                    }
                  }
                  catch (error) {
                    // Manejo de errores
                    console.error("Error durante el inicio de sesión:", error);
                  }
                    
                }}
                
                onError={() => {
                  console.error("ErrorAAA:");
                }}
                      
            /> 
      
    </GoogleOAuthProvider>
  )
}

export default GoogleOAuth


