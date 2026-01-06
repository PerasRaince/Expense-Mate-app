const groupBy = (arr, fn) =>
  arr.reduce((acc, x) => {
    const k = fn(x);
    acc[k] = acc[k] || [];
    acc[k].push(x);
    return acc;
  }, {});

// Date helpers
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });

export default function ExpenseList({ expenses, refs, active, searchQuery, searchResults }) {
  const now = new Date();

  // Use search results if available, otherwise use all expenses
  const expensesToShow = searchResults && searchResults.expenses ? searchResults.expenses : expenses;

  // Sort newest first
  const sorted = [...expensesToShow].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const today = sorted.filter(
    e => new Date(e.date).toDateString() === now.toDateString()
  );

  const week = sorted.filter(
    e => new Date(e.date) >= new Date(now - 7 * 86400000)
  );

  const month = sorted.filter(
    e =>
      new Date(e.date).getMonth() === now.getMonth() &&
      new Date(e.date).getFullYear() === now.getFullYear()
  );

  const year = sorted.filter(
    e => new Date(e.date).getFullYear() === now.getFullYear()
  );

  return (
    <>
      {/* TODAY */}
      {active === "today" && (
        <section ref={refs.today}>
          <h3>Today</h3>
          {today.map((e, i) => (
            <Item key={i} e={e} showDate searchQuery={searchQuery} />
          ))}
        </section>
      )}

      {/* WEEK (grouped by date) */}
      {active === "week" && (
        <section ref={refs.week}>
          <h3>This Week</h3>
          {Object.entries(
            groupBy(week, e => formatDate(e.date))
          ).map(([day, list]) => (
            <Group key={day} title={day} list={list} searchQuery={searchQuery} />
          ))}
        </section>
      )}

      {/* MONTH (grouped by week → date) */}
      {active === "month" && (
        <section ref={refs.month}>
          <h3>This Month</h3>
          {Object.entries(
            groupBy(month, e =>
              `Week ${Math.ceil(new Date(e.date).getDate() / 7)}`
            )
          ).map(([weekLabel, list]) => (
            <div key={weekLabel}>
              <h4>{weekLabel}</h4>
              {Object.entries(
                groupBy(list, e => formatDate(e.date))
              ).map(([day, items]) => (
                <Group key={day} title={day} list={items} searchQuery={searchQuery} />
              ))}
            </div>
          ))}
        </section>
      )}

      {/* YEAR (grouped by month → date) */}
      {active === "year" && (
        <section ref={refs.year}>
          <h3>This Year</h3>
          {Object.entries(
            groupBy(year, e =>
              new Date(e.date).toLocaleString("default", {
                month: "long"
              })
            )
          ).map(([monthName, list]) => (
            <div key={monthName}>
              <h4>{monthName}</h4>
              {Object.entries(
                groupBy(list, e => formatDate(e.date))
              ).map(([day, items]) => (
                <Group key={day} title={day} list={items} searchQuery={searchQuery} />
              ))}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function Group({ title, list, searchQuery }) {
  return (
    <div className="glass-card">
      <h5>{title}</h5>
      {list.map((e, i) => (
        <Item key={i} e={e} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

function Item({ e, showDate, searchQuery }) {
  // Highlight search terms in the item name
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="stack-item">
      <div>
        <div>{highlightText(e.item, searchQuery)}</div>
        {showDate && (
          <small style={{ opacity: 0.6 }}>
            {new Date(e.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </small>
        )}
      </div>
      <b>₹ {e.amount}</b>
    </div>
  );
}
