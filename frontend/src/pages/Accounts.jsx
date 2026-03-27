import { useState, useEffect } from 'react';
import AccountsPieChart from '../components/charts/AccountsPieChart.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';

const formatVND = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// account row
function AccountRow({ label, keyName, temp, setTemp, editing, total }) {
  const getPercent = (value) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="account-row">
      <div>
        <p className="acc-label">{label}</p>
        <p className="acc-sub">
          {formatVND(temp[keyName])} VND • {getPercent(temp[keyName])}%
        </p>
      </div>

      {editing && (
        <input
          type="number"
          value={temp[keyName]}
          onChange={(e) =>
            setTemp({ ...temp, [keyName]: Number(e.target.value) })
          }
        />
      )}
    </div>
  );
}

export default function Accounts({
  initialBalances,
  setInitialBalances,
  transactions = []
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(initialBalances);

  useEffect(() => {
    setTemp(initialBalances);
  }, [initialBalances]);

  // live balances
  const balances = {
    checking: initialBalances.checking || 0,
    savings: initialBalances.savings || 0,
    cash: initialBalances.cash || 0,
    investments: initialBalances.investments || 0
  };

  transactions.forEach((tx) => {
    if (balances[tx.account] !== undefined) {
      balances[tx.account] += tx.amount;
    }
  });

  const total =
    balances.checking +
    balances.savings +
    balances.cash +
    balances.investments;

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(temp)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Save failed:", data);
        return;
      }

      setInitialBalances({
        checking: data.checking || 0,
        savings: data.savings || 0,
        cash: data.cash || 0,
        investments: data.investments || 0
      });

      setEditing(false);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '10px' }}>Accounts</h1>

      {/* main */}
      <div className="accounts-card">

        {/* title */}
        <div className="top-bar" style={{ marginBottom: '10px' }}>
          <div>
            <p className="acc-label">Total Balance</p>
            <h2>{formatVND(total)} VND</h2>
          </div>

          {!editing ? (
            <button onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <button onClick={handleSave}>Save</button>
          )}
        </div>

        {/* accounts breakdown */}
        <AccountRow label="Checking" keyName="checking" temp={temp} setTemp={setTemp} editing={editing} total={total} />
        <AccountRow label="Savings" keyName="savings" temp={temp} setTemp={setTemp} editing={editing} total={total} />
        <AccountRow label="Cash" keyName="cash" temp={temp} setTemp={setTemp} editing={editing} total={total} />
        <AccountRow label="Investments" keyName="investments" temp={temp} setTemp={setTemp} editing={editing} total={total} />

      </div>

      {/* charts */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>

        <div className="chart-card">
          <h3 className="chart-title">Distribution</h3>
          <AccountsPieChart
            initialBalances={initialBalances}
            transactions={transactions}
          />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Monthly Flow</h3>
          <MonthlyBarChart transactions={transactions} />
        </div>

      </div>
    </div>
  );
}