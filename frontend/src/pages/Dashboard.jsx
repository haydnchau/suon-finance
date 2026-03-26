import { useState } from 'react';
import StatCard from '../components/ui/StatCard';
import BalanceLineChart from '../components/charts/BalanceLineChart';
import TransactionList from '../components/transactions/TransactionList';
import AccountsPieChart from '../components/charts/AccountsPieChart';
import AddTransaction from '../components/transactions/AddTransaction';

const formatVND = (num) => {
return new Intl.NumberFormat('vi-VN').format(num);
};

const getBalanceOverTime = (transactions, filterType, viewType, initialBalances) => {
const accounts = ['checking','savings','cash','investments'];
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// 🔥 STEP 1: SORT TRANSACTIONS BY DATE
const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
);

const buckets = {};
const running = { ...initialBalances };

sorted.forEach(tx => {
    const date = new Date(tx.date);
    let key;

    // 🟢 WEEK = last 7 days (not all Mondays ever)
    if (filterType === 'week') {
    key = dayNames[(date.getDay() + 6) % 7]; // convert Sun-first → Mon-first
    }

    // 🟡 MONTH = 1–7, 8–14, etc
    else if (filterType === 'month') {
    const day = date.getDate();
    const start = Math.floor((day - 1) / 7) * 7 + 1;
    const end = Math.min(start + 6, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
    key = `${monthNames[date.getMonth()]} ${start}-${end}`;
    }

    // 🔵 YEAR = months
    else if (filterType === 'year') {
    key = monthNames[date.getMonth()];
    }

    // ⚫ ALL = years
    else {
    key = `${date.getFullYear()}`;
    }

    // update running balance FIRST
    running[tx.account] += tx.amount;

    // store snapshot of balance at this point
    buckets[key] = { ...running };
});

// 🔥 STEP 2: DEFINE X AXIS ORDER
let xAxis = [];

if (filterType === 'week') {
    xAxis = dayNames;
} 
else if (filterType === 'year') {
    xAxis = monthNames;
} 
else if (filterType === 'month') {
    xAxis = Object.keys(buckets).sort((a, b) => {
    const getStart = str => parseInt(str.split(' ')[1]);
    return getStart(a) - getStart(b);
    });
} 
else {
    xAxis = Object.keys(buckets).sort();
}

// 🔥 STEP 3: BUILD SERIES
let series;

if (viewType === 'total') {
series = [
    {
    id: 'total',
    label: 'Total Balance',
    data: xAxis.map(x => {
        if (!buckets[x]) return 0;
        return (
        buckets[x].checking +
        buckets[x].savings +
        buckets[x].cash +
        buckets[x].investments
        );
    }),
    area: true,
    curve: 'monotoneX',
    color: '#60A5FA',
    }
];
} else {
series = accounts.map(acc => ({
    id: acc,
    label: acc.charAt(0).toUpperCase() + acc.slice(1),
    data: xAxis.map(x => (buckets[x] ? buckets[x][acc] : 0)),
    area: true,
    curve: 'monotoneX',
    color:
    acc === 'checking' ? '#6C7BFF' :
    acc === 'savings' ? '#FBBF24' :
    acc === 'cash' ? '#F87171' :
    '#34D399',
}));
}

return { xAxis, series };
};

export default function Dashboard({ initialBalances, transactions, setTransactions }) {
    const [showForm, setShowForm] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    const [chartFilter, setChartFilter] = useState('week');
    const [chartView, setChartView] = useState('accounts'); // 'accounts' or 'total'

    // 🔥 FILTER STATE
    const [filters, setFilters] = useState({
        type: 'all',
        value: '',
        account: 'all',
    });

    const deleteTransaction = async (id) => {
    console.log("🧨 DELETE CLICKED ID:", id);

    if (!id) return; // 🔥 PREVENT BAD CALL

    try {
        const user = JSON.parse(localStorage.getItem("currentUser"));

        await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${user.token}`
        }
        });

        setTransactions(prev => prev.filter(tx => tx._id !== id));

    } catch (err) {
        console.error(err);
    }
    };

    // 🔥 FILTER LOGIC
    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);

        if (filters.account !== 'all' && tx.account !== filters.account) {
        return false;
        }

        if (filters.type === 'date' && filters.value) {
        return tx.date === filters.value;
        }

        if (filters.type === 'month' && filters.value) {
        const [year, month] = filters.value.split('-');
        return (
            txDate.getFullYear() === Number(year) &&
            txDate.getMonth() + 1 === Number(month)
        );
        }

        if (filters.type === 'year' && filters.value) {
        return txDate.getFullYear() === Number(filters.value);
        }

        return true;
    });

    // totals (use filtered if you want dynamic stats later)
    const totalBalance =
        initialBalances.checking +
        initialBalances.savings +
        initialBalances.cash +
        initialBalances.investments +
        transactions.reduce((sum, t) => sum + t.amount, 0);

    const income = filteredTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const chartData = 
        transactions.length === 0
            ? { xAxis: [], series: [] }
            : getBalanceOverTime(
                filteredTransactions,
                chartFilter,
                chartView,
                initialBalances
            );
    
            
    return (
        <div>
        <div className="top-bar">
            <h1>SUON FINANCE</h1>

            <button className="add-btn" onClick={() => setShowForm(true)}>
            Add Transaction
            </button>

            {showForm && (
            <AddTransaction
                onAdd={async (tx) => {
                try {
                    const user = JSON.parse(localStorage.getItem("currentUser"));

                    const res = await fetch("http://localhost:5000/api/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify(tx)
                    });

                    const newTx = await res.json();

                    setTransactions(prev => [newTx, ...prev]); // 🔥 THIS LINE
                    setShowForm(false);

                } catch (err) {
                    console.error(err);
                }
                }}
                onClose={() => setShowForm(false)}
            />
            )}
        </div>

        <div className="cards">
            <StatCard title="Total Balance" value={`${formatVND(totalBalance)} VND`} />
            <StatCard title="Monthly Income" value={`${formatVND(income)} VND`} type="income" />
            <StatCard title="Monthly Expenses" value={`${formatVND(expenses)} VND`} type="expense" />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* LEFT: LINE CHART */}
        <div className="chart-card" style={{ flex: 1 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 className="chart-title">Total Balance Over Time</h3>

            <div style={{ display: 'flex', gap: '10px' }}>
                <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
                </select>

                <select
                value={chartView}
                onChange={(e) => setChartView(e.target.value)}
                >
                <option value="accounts">By Account</option>
                <option value="total">Total</option>
                </select>
            </div>
            </div>

            <BalanceLineChart 
            xAxis={chartData.xAxis} 
            series={chartData.series} 
            />
        </div>

        {/* RIGHT: PIE CHART */}
        <div className="chart-card" style={{ flex: 1 }}>
            <h3 className="chart-title">Account Distribution</h3>
            <AccountsPieChart 
                initialBalances={initialBalances} 
                transactions={filteredTransactions} 
                />
        </div>
        </div>
        {/* 🔥 FILTER UI */}
        <div className="filters">
            <select
            value={filters.type}
            onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, value: '' })
            }
            >
            <option value="all">All Time</option>
            <option value="date">Specific Date</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            </select>

            {filters.type === 'date' && (
            <input
                type="date"
                onChange={(e) =>
                setFilters({ ...filters, value: e.target.value })
                }
            />
            )}

            {filters.type === 'month' && (
            <input
                type="month"
                onChange={(e) =>
                setFilters({ ...filters, value: e.target.value })
                }
            />
            )}

            {filters.type === 'year' && (
            <input
                type="number"
                placeholder="Year"
                onChange={(e) =>
                setFilters({ ...filters, value: e.target.value })
                }
            />
            )}

            <select
            value={filters.account}
            onChange={(e) =>
                setFilters({ ...filters, account: e.target.value })
            }
            >
            <option value="all">All Accounts</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
            </select>

            {/* 🔥 RESET BUTTON */}
            <button
            onClick={() =>
                setFilters({ type: 'all', value: '', account: 'all' })
            }
            >
            Reset
            </button>
        </div>

        <h2 style={{ marginTop: '20px' }}>
            Transaction History ({filteredTransactions.length})
        </h2>

        {filteredTransactions.length === 0 && (
            <p style={{ opacity: 0.6 }}>No transactions yet...</p>
        )}

        <TransactionList
            transactions={filteredTransactions}
            onDelete={deleteTransaction}
            formatVND={formatVND}
            onSelect={setSelectedTx}   // 🔥 THIS
        />
        {/* 🔥 MODAL */}
        {selectedTx && (
            <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>

                <h2>{selectedTx.description}</h2>

                <p><strong>Amount:</strong> {formatVND(selectedTx.amount)} VND</p>
                <p><strong>Date:</strong> {selectedTx.date}</p>
                <p><strong>Account:</strong> {selectedTx.account}</p>

                <button onClick={() => setSelectedTx(null)}>Close</button>

                </div>
            </div>
            )}
        </div>
    );
}