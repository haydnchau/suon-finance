import { LineChart } from '@mui/x-charts/LineChart';

export default function BalanceLineChart({ xAxis, series }) {
  return (
    <LineChart
      xAxis={[
        {
          scaleType: 'point',
          data: xAxis,
        },
      ]}
      series={series}
      height={320}
      sx={{
        '& .MuiAreaElement-root': {
          opacity: 0.10,
        },
      }}
    />
  );
}