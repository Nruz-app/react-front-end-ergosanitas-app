import { Card, CardActionArea, CardContent, Typography } from "@mui/material"

interface CardEdProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}


export const CardEd = ({ icon, value, label, color }: CardEdProps) => {

  return (
    <Card sx={{ boxShadow: 5, borderRadius: 4, backgroundColor: color }}>
      <CardActionArea>
        <CardContent sx={{ textAlign: 'center' }}>
          {icon}
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2">{label}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )

}
