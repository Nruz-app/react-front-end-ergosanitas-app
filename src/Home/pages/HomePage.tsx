
import { MarqueeHome,
  //BoxWelcome, 
  //CarrucelServicios, 
  //BoxVideo,
  //VideoPlay, 
  GalleryImage, 
  //BoxServicios
} from '../components/';

import { CarouserServer } from '../components/carousel-swiper';

//import { ModalProvider } from '../../common/context';

export const HomePage = () => {
  return (
    <>
      <MarqueeHome dirrection='right' />
       {
      /*
        <BoxWelcome />
        <BoxServicios />
        <BoxWelcome />
        <ModalProvider>
            <BoxVideo />
            <VideoPlay />
        </ModalProvider>
        <CarrucelServicios />
        */
       }

      <CarouserServer />
       
      <GalleryImage />
    </>
  )
}


export default HomePage;