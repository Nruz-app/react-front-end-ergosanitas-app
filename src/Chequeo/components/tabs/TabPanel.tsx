
import React from 'react'
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }


export const TabPanel = (props: TabPanelProps) => {

    const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  )
}
