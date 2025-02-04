//https://www.npmjs.com/package/react-fast-marquee

import Marquee from 'react-fast-marquee';

import { MarqueeBox } from './MarqueeBox';
import { Box } from '@mui/material';

interface Props {
  dirrection: "left" | "right"| "up"| "down";
}


export const MarqueeHome = ( { dirrection }:Props) => {
  return (
    <Box ml={ 4 } mr={ 4 } mt={ 2 } sx={{ flexGrow: 1 }} >
      <Marquee
        autoFill={true}
        pauseOnHover={true}
        gradient={true}
        direction = { dirrection }
      >
        <MarqueeBox
            type="ergoSanitasApp" />      
          <MarqueeBox
            type="WhatsApp" />
          <MarqueeBox
            type="FaceBookApp" />
          <MarqueeBox
            type="TiktokApp" />
        </Marquee>
    </Box>
  )
}
