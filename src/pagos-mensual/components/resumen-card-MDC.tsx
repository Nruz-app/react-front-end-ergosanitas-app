import {
  Box,
  Stack,
  Typography
} from "@mui/material";

interface Props {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

export const ResumenCardMDC = ({ icon,title,value,color }: Props) => {

  return (
    <Box
      sx={{
        borderRadius: "20px",
        p: 2.2,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        transition: "all .2s ease",
        "&:hover": {
          background: "rgba(255,255,255,0.12)",
          transform: "scale(1.02)"
        }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={1.5}
      >
        {icon}

        <Typography
          variant="caption"
          sx={{
            opacity: 0.8,
            letterSpacing: 1,
            fontWeight: 700
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          color,
          fontSize: {
            xs: "1.4rem",
            md: "1.6rem"
          }
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}