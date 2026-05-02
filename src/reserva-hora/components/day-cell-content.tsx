import { Box, Typography } from "@mui/material";
import { IAgendaMensual, Idata } from "../interfaces/agenda-mensual";

interface Props {
  dayNumberText: string;
  dia?: IAgendaMensual;
  isMobile: boolean;
}

export const DayCellContent = ({ dayNumberText, dia }: Props) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          {dayNumberText}
        </Typography>

        {dia && (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "success.main",
            }}
          >
            {dia.total}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {dia?.data.map((item: Idata, i: number) => (
          <Box
            key={i}
            sx={{
              backgroundColor: "#E8F5E9",
              borderLeft: "4px solid #4CAF50",
              borderRadius: 1,
              px: 0.5,
              py: 0.3,
              fontSize: "0.7rem",
              lineHeight: 1.2,
            }}
          >
            <strong>{item.user_email.split("@")[0]}</strong>{" "}
            ({item.cantidad})
          </Box>
        ))}
      </Box>
    </Box>
  );
}