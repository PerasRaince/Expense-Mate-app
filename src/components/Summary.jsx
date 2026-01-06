export default function Summary({ expenses, onSelect, active, searchResults }) {
  const now = new Date();

  // Use search results if available, otherwise use all expenses
  const expensesToAnalyze = searchResults && searchResults.expenses ? searchResults.expenses : expenses;

  const total = (fn) =>
    expensesToAnalyze.filter(e => fn(new Date(e.date)))
            .reduce((s, e) => s + e.amount, 0);

  // If we have search results, show the search totals instead
  const getDisplayTotal = (period) => {
    if (searchResults && searchResults.expenses) {
      // For search results, show the filtered total for all periods
      return searchResults.total;
    }
    
    // Normal period-based totals
    switch (period) {
      case "today":
        return total(d => d.toDateString() === now.toDateString());
      case "week":
        return total(d => d >= new Date(now - 7 * 86400000));
      case "month":
        return total(d => d.getMonth() === now.getMonth());
      case "year":
        return total(d => d.getFullYear() === now.getFullYear());
      default:
        return 0;
    }
  };

  return (
    <div className="grid">
      <div
        className={`grid-card ${active === "today" ? "active" : ""}`}
        onClick={() => onSelect("today")}
      >
        <span>Today</span>
        <b>₹ {getDisplayTotal("today")}</b>
      </div>

      <div
        className={`grid-card ${active === "week" ? "active" : ""}`}
        onClick={() => onSelect("week")}
      >
        <span>Week</span>
        <b>₹ {getDisplayTotal("week")}</b>
      </div>

      <div
        className={`grid-card ${active === "month" ? "active" : ""}`}
        onClick={() => onSelect("month")}
      >
        <span>Month</span>
        <b>₹ {getDisplayTotal("month")}</b>
      </div>

      <div
        className={`grid-card ${active === "year" ? "active" : ""}`}
        onClick={() => onSelect("year")}
      >
        <span>Year</span>
        <b>₹ {getDisplayTotal("year")}</b>
      </div>
    </div>
  );
}
