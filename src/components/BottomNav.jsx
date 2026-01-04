export default function BottomNav({ scrollToToday, setShowTodo, showTodo }) {
  return (
    <nav className="bottom-nav">
      <button
        className={!showTodo ? "active" : ""}
        onClick={() => {
          setShowTodo(false);
          scrollToToday();
        }}
      >
        ⌂
      </button>

      <button
        className={showTodo ? "active" : ""}
        onClick={() => setShowTodo(true)}
      >
        ✓
      </button>
    </nav>
  );
}
