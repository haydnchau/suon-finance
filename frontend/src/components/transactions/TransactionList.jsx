export default function TransactionList({ transactions, onDelete, formatVND, onSelect }) {
  const grouped = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(grouped).map(date => (
        <div key={date} className="transaction-group">
          <h3 className="date">{date}</h3>

          {grouped[date].map(tx => (
              <div
                key={tx.id}
                className="transaction-row"
                onClick={() => onSelect(tx)}
                style={{ cursor: 'pointer' }}
              >

              {/* left side */}
              <div className="left">
                <p className="desc" title={tx.description}>
                  {tx.description}
                </p>

                {/* small sub info */}
                <div className="sub-row">
                  <span className={`badge ${tx.account}`}>
                    {tx.account?.charAt(0).toUpperCase() + tx.account?.slice(1) || 'checkings'}
                  </span>
                </div>
              </div>

              {/* right side */}
              <div className="right">
                <p
                  className="amount"
                  style={{
                    color: tx.amount > 0 ? '#4ade80' : '#f87171'
                  }}
                >
                  {formatVND(tx.amount)}
                </p>

                <button onClick={() => onDelete(tx._id)}>✕</button>
              </div>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

