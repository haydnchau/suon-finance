export default function StatCard({ title, value, type }) {
  return (
    <div className="stat-card">
      <p className="title">{title}</p>
      <h2 className={type}>{value}</h2>
    </div>
  );
}