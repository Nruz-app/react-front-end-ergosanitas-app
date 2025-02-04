
import { LoginProvider, ModalProvider,SubMenuProvider } from './common/context';
import { Footer } from './Footer/pages/FooterPages';
import { AppLoginPages } from './Login/pages';
import { NavigationApp } from './routes/NavigationApp';

import { isMobile } from 'react-device-detect';

function App() {

  if(isMobile) {
    console.log('celulkar');
  }
  

  return (
    <LoginProvider>
      <ModalProvider>
         <SubMenuProvider>
            <NavigationApp />
            <Footer />
            <AppLoginPages />
          </SubMenuProvider>  
      </ModalProvider>
    </LoginProvider>    
  )
}

export default App
