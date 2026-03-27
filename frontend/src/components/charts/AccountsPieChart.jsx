import { PieChart } from '@mui/x-charts/PieChart';

export default function AccountsPieChart({ initialBalances, transactions = [] }) {

  const accounts = ['checking', 'savings', 'cash', 'investments'];

  // preventing errors before data loads or if user has no data
  if (!initialBalances) {
    return <p style={{ opacity: 0.6 }}>No data yet...</p>;
  }

  // 🌊 calculate live balances
  const balances = { ...initialBalances };

  transactions.forEach(tx => {
    if (!accounts.includes(tx.account)) return;
    balances[tx.account] += tx.amount;
  });

  // 🧠 total for percentages
  const total = Object.values(balances).reduce((a, b) => a + b, 0);

  const data = accounts.map((acc, index) => {
    const value = balances[acc] || 0;
    const percent = total === 0 ? 0 : ((value / total) * 100).toFixed(1);

    return {
      id: index,
      value,
      label: `${acc.charAt(0).toUpperCase() + acc.slice(1)} (${percent}%)`
    };
  });

  return (
    <PieChart
      series={[{ data }]}
      width={320}
      height={300}
    />
  );
}