
import { MarqueeHome,
  BoxWelcome, 
  CarrucelServicios, 
  //BoxVideo,
  //VideoPlay, 
  GalleryImage, 
  //BoxServicios
} from '../components/';

//import { ModalProvider } from '../../common/context';

export const HomePage = () => {
  return (
    <>
      <MarqueeHome 
        dirrection='right'
      />
      <BoxWelcome />  
      
       {
        /*
           <BoxServicios />
          <BoxWelcome />
          <ModalProvider>
              <BoxVideo />
              <VideoPlay />
        </ModalProvider>
        */
       }
       
      <CarrucelServicios />
       
      <GalleryImage />
    </>
  )
}


export default HomePage;