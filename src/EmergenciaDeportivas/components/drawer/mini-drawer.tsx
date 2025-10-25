import React from "react";
import { Box } from "@mui/material";
import { DrawerMenu } from "./drawer-menu";
import { DrawerHeader } from "./drawer-header";

interface MiniDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MiniDrawer: React.FC<MiniDrawerProps> = ({ open, onClose }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <DrawerMenu open={open} onClose={onClose} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
      </Box>
    </Box>
  );
};
