export default function Summary({ expenses, onSelect, active }) {
  const now = new Date();

  const total = (fn) =>
    expenses.filter(e => fn(new Date(e.date)))
            .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid">
      <div
        className={`grid-card ${active === "today" ? "active" : ""}`}
        onClick={() => onSelect("today")}
      >
        <span>Today</span>
        <b>₹ {total(d => d.toDateString() === now.toDateString())}</b>
      </div>

      <div
        className={`grid-card ${active === "week" ? "active" : ""}`}
        onClick={() => onSelect("week")}
      >
        <span>Week</span>
        <b>₹ {total(d => d >= new Date(now - 7 * 86400000))}</b>
      </div>

      <div
        className={`grid-card ${active === "month" ? "active" : ""}`}
        onClick={() => onSelect("month")}
      >
        <span>Month</span>
        <b>₹ {total(d => d.getMonth() === now.getMonth())}</b>
      </div>

      <div
        className={`grid-card ${active === "year" ? "active" : ""}`}
        onClick={() => onSelect("year")}
      >
        <span>Year</span>
        <b>₹ {total(d => d.getFullYear() === now.getFullYear())}</b>
      </div>
    </div>
  );
}
