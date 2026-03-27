import { useState } from 'react';

export default function AddTransaction({ onAdd, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    account: 'checking',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // required fields validation
    if (!form.description || !form.amount) {
      alert('Description and amount are required');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    onAdd({
      ...form,
      amount: Number(form.amount),
      date: form.date || today, // auto-fill date if left blank
    });
  };

  return (
    <div className="modal-overlay">
      <form className="modal">
        <h2>Add Transaction</h2>

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <select
          value={form.account}
          onChange={(e) =>
            setForm({ ...form, account: e.target.value })
          }
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="cash">Cash</option>
        </select>

        <div className="modal-buttons">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button onClick={handleSubmit}>
            Add
          </button>
        </div>
      </form>
    </div>
  );
}