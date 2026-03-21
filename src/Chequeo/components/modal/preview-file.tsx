import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  url_pdf?: string;
}

export const PreviewFileDialog = ({ open, onClose, url_pdf }: Props) => {
  const [zoom, setZoom] = useState(1);

  let extension = 'jpg';
  if (url_pdf) {
    const path = url_pdf.split('.');
    extension = path[path.length - 1].toLowerCase();
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      
      {/* HEADER */}
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>

          <Typography sx={{ ml: 2, flex: 1 }}>
            Vista previa
          </Typography>

          {/* ZOOM SOLO PARA IMAGEN */}
          {extension !== "pdf" && (
            <>
              <IconButton color="inherit" onClick={() => setZoom(z => z + 0.2)}>
                <ZoomInIcon />
              </IconButton>

              <IconButton color="inherit" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
                <ZoomOutIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* CONTENIDO */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000"
        }}
      >
        {extension === "pdf" ? (
          <iframe
            src={url_pdf}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
            title="PDF Preview"
          />
        ) : (
          <img
            src={url_pdf}
            alt="preview"
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }}
          />
        )}
      </Box>
    </Dialog>
  )
}