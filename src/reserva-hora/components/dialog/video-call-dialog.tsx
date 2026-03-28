import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

interface Props {
    open: boolean;
    onClose: () => void;
    roomName: string;
}

export const VideoCallDialog = ({ open, onClose, roomName }: Props) => {

  if (!roomName) return null;

  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        TeleMedicina
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture"
          style={{
            width: '100%',
            height: '80vh',
            border: 0
          }}
        />
      </DialogContent>
    </Dialog>
  );
}