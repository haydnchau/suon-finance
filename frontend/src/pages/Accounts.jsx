import { useState, useEffect } from 'react';
import AccountsPieChart from '../components/charts/AccountsPieChart.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';

const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const parseNumber = (value) => {
  return Number(value.replace(/,/g, '')) || 0;
};

function AccountField({ label, value, onChange, editable = true }) {
  return (
    <div className="account-row">
      <p className="acc-label">{label}</p>

      {editable ? (
        <input value={value} onChange={onChange} />
      ) : (
        <p className="acc-value">{value}</p>
      )}
    </div>
  );
}

const getDaysLeft = (date) => {
  if (!date) return null;

  const today = new Date();
  const target = new Date(date);

  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Accounts({
  initialBalances,
  setInitialBalances,
  transactions = [],
  savingsList,
  setSavingsList
}) {
  const [temp, setTemp] = useState(() => initialBalances);
  const [openEditor, setOpenEditor] = useState(false);
  const [openSavings, setOpenSavings] = useState(false);
  const [message, setMessage] = useState(null);
  const [newSaving, setNewSaving] = useState({
    amount: '',
    accountNumber: '',
    interest: '',
    maturity: ''
  });

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser"));

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/savings`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const data = await res.json();
        setSavingsList(data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchSavings();
  }, [setSavingsList]);

  const balances = { ...initialBalances };

  // apply transactions
  transactions.forEach(tx => {
    if (balances[tx.account] !== undefined) {
      balances[tx.account] += tx.amount;
    }
  });

  // calculate savings ONLY from savingsList (single source of truth)
  const totalSavings = (savingsList || []).reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );

  // override savings instead of adding
  balances.savings = totalSavings;

  const total =
    balances.checking +
    balances.savings +
    balances.cash;

  const sortedSavings = [...(savingsList || [])].sort((a, b) => {
    if (!a.maturity) return 1;
    if (!b.maturity) return -1;
    return new Date(a.maturity) - new Date(b.maturity);
  });

  const handleSave = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/accounts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...temp,
          savings: totalSavings // combined savings value
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: 'Failed to save changes' });
      return;
    }

    setInitialBalances(data);
    setMessage({ type: 'success', text: 'Changes saved successfully' });

  } catch (err) {
    console.error(err);
    setMessage({ type: 'error', text: 'Server error' });
  }
};

  const [editing, setEditing] = useState(false);

  const [showSavingsModal, setShowSavingsModal] = useState(false);

  return (
    <div>
      <h1>Accounts</h1>

      {showSavingsModal && (
  <div className="modal-overlay" onClick={() => setShowSavingsModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>

      <h2>Add Savings</h2>

      <input
        placeholder="Amount"
        value={formatNumber(newSaving.amount)}
        onChange={(e) => {
          const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
          setNewSaving({ ...newSaving, amount: raw });
        }}
      />

      <input
        placeholder="Account Number (optional)"
        value={newSaving.accountNumber}
        onChange={(e) => {
          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
          setNewSaving({ ...newSaving, accountNumber: val });
        }}
      />

      <input
        placeholder="Interest Rate (%) e.g. 5.5"
        value={newSaving.interest}
        onChange={(e) => {
          const val = e.target.value
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*)\./g, '$1');
          setNewSaving({ ...newSaving, interest: val });
        }}
      />

      <input
        type="date"
        value={newSaving.maturity}
        onChange={(e) =>
          setNewSaving({
            ...newSaving,
            maturity: e.target.value
          })
        }
      />

      <button
        className="add-btn"
        onClick={async () => {
          if (!newSaving.amount || !newSaving.interest || !newSaving.maturity) {
            setMessage({ type: 'error', text: 'Please fill all required fields' });
            return;
          }

          try {
            const user = JSON.parse(localStorage.getItem("currentUser"));

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/savings`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                amount: Number(newSaving.amount),
                interest: Number(newSaving.interest),
                maturity: newSaving.maturity,
                accountNumber: newSaving.accountNumber
              })
            });

            const data = await res.json();

            if (!res.ok) {
              console.error(data);
              setMessage({ type: 'error', text: 'Failed to add saving' });
              return;
            }

            // ✅ update UI instantly
            setSavingsList(prev => [...prev, data]);

            // ✅ reset form
            setNewSaving({
              amount: '',
              accountNumber: '',
              interest: '',
              maturity: ''
            });

            setShowSavingsModal(false);

          } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Server error' });
          }
        }}
      >
        Add
      </button>

    </div>
  </div>
)}

      <div
  className="accounts-summary clickable"
  onClick={() => setOpenEditor(!openEditor)}
>
  <h2>Total Balance</h2>
  <p>{formatNumber(total)} VND</p>
  <span className="hint">
    {openEditor ? "Click to collapse" : "Click to see more"}
  </span>
</div>

{openEditor && (
  <div className="accounts-expanded">

    {/* EDIT TOGGLE */}
    <div className="edit-toggle">
      <button
        onClick={() => {
          setTemp(initialBalances); // sync here instead
          setEditing(!editing);
        }}
      >
        {editing ? "Done Editing" : "Edit"}
      </button>
    </div>

    {/* CHECKING */}
    <AccountField
      label="Checking"
      value={editing ? formatNumber(temp.checking) : `${formatNumber(temp.checking)} VND`}
      editable={editing}
      onChange={(e) =>
        setTemp({
          ...temp,
          checking: parseNumber(e.target.value)
        })
      }
    />

    {/* CASH */}
    <AccountField
      label="Cash"
      value={formatNumber(temp.cash)}
      editable={editing}
      onChange={(e) =>
        setTemp({
          ...temp,
          cash: parseNumber(e.target.value)
        })
      }
    />

    {/* SAVINGS */}
    <div
      className="account-row clickable"
      onClick={() => setOpenSavings(prev => !prev)}
    >
      <p className="acc-label">Savings</p>
      <p className="acc-value">{formatNumber(totalSavings)} VND</p>
    </div>

    {/* SAVINGS EXPAND */}
    {openSavings && (
      <div className="savings-container">

        <p className="acc-value">
          {totalSavings > 0
            ? `${formatNumber(totalSavings)} VND`
            : editing
            ? "Click to add savings"
            : "No savings yet"}
        </p>

        {sortedSavings.map((s) => {
          const futureValue = Math.round(
            s.amount * (1 + (s.interest || 0) / 100)
          );

          const daysLeft = getDaysLeft(s.maturity);
            
          return (
            <div key={s._id} className="savings-card">

              <div className="savings-top">
                <p>{formatNumber(s.amount)} VND</p>

                {editing && (
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      try {
                        const user = JSON.parse(localStorage.getItem("currentUser"));

                        await fetch(`${import.meta.env.VITE_API_URL}/api/savings/${s._id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${user.token}`
                          }
                        });

                        // update UI after success
                        setSavingsList(prev =>
                          prev.filter(item => item._id !== s._id)
                        );

                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="savings-details">
                {s.accountNumber && <p>Acc #: {s.accountNumber}</p>}
                <p>Interest: {Number(s.interest).toFixed(2)}%</p>
                <p>Maturity: {s.maturity || "—"}</p>
                <p className="days-left">
                  {daysLeft !== null ? `${daysLeft} days left` : "No maturity"}
                </p>
                <p className="future">
                  Future: {formatNumber(futureValue)} VND
                </p>
              </div>
            </div>
          );
        })}

        {editing && (
          <div className="modal-actions">
            <button
              className="confirm-btn"
              onClick={() => setShowSavingsModal(true)}
            >
              Add Savings
            </button>
          </div>
        )}
      </div>
    )}

    {/* SAVE */}
    {editing && (
      <button className="save-wide" onClick={handleSave}>
        Save Changes
      </button>
    )}

    {message && (
      <p className={`message ${message.type}`}>
        {message.text}
      </p>
    )}

  </div>
)}

    </div>
  );
}