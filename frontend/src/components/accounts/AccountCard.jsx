export default function AccountCard({ account }) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      background: '#1e1e1e',
      color: 'white',
      marginBottom: '12px'
    }}>
      <h2>{account.name}</h2>
      <p>Balance: ${account.balance}</p>
      <p>Account No: {account.number}</p>

      {account.type === 'savings' && (
        <>
          <p>Interest Rate: {account.interest}%</p>
          <p>Maturity: {account.maturityDate}</p>
        </>
      )}
    </div>
  );
}