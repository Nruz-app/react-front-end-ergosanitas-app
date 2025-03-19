
import React from 'react'
import { Box } from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }


export const TabPanel = (props: TabPanelProps) => {

    const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      sx={{
        display: value !== index ? "none" : "block",
        p: 3,
        bgcolor: "background.default",
        borderRadius: 2,
      }}
      {...other}
    >
      {children}
    </Box>
  );
  
}
