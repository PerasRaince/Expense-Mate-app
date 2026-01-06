export default function BottomNav({ scrollToToday, onExpenseClick, onTodoClick, showTodo }) {
  
  const handleExpenseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🧾 Bottom nav: Expense clicked');
    onExpenseClick();
    if (!showTodo) {
      scrollToToday();
    }
  };

  const handleTodoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📋 Bottom nav: Todo clicked');
    onTodoClick();
  };

  return (
    <nav className="bottom-nav">
      <button
        className={!showTodo ? "active" : ""}
        onClick={handleExpenseClick}
        type="button"
      >
        <span className="nav-icon">₹</span>
        <span className="nav-label">Expenses</span>
      </button>

      <button
        className={showTodo ? "active" : ""}
        onClick={handleTodoClick}
        type="button"
      >
        <span className="nav-icon">✓</span>
        <span className="nav-label">Tasks</span>
      </button>
    </nav>
  );
}
