import { BarChart } from '@mui/x-charts/BarChart';

export default function MonthlyBarChart({ transactions = [] }) {

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyTotals = new Array(12).fill(0);

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const month = date.getMonth();

    monthlyTotals[month] += tx.amount;
  });

  return (
    <BarChart
      xAxis={[
        {
          scaleType: 'band',
          data: months,
        },
      ]}
      series={[
        {
          data: monthlyTotals,
        },
      ]}
      height={300}
    />
  );
}