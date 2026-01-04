import { useState, useEffect, useRef } from "react";

import ExpenseForm from "./components/ExpenseForm";
import Summary from "./components/Summary";
import ExpenseList from "./components/ExpenseList";
import BottomNav from "./components/BottomNav";
import Todo from "./components/Todo";

export default function App() {
  /* ================= EXPENSE STATE ================= */

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  /* ================= UI STATE ================= */

  const [showTodo, setShowTodo] = useState(false);

  // "today" | "week" | "month" | "year"
  const [activeSection, setActiveSection] = useState("today");

  // dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ================= SWIPE REFS ================= */

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* ================= SCROLL REFS ================= */

  const refs = {
    today: useRef(null),
    week: useRef(null),
    month: useRef(null),
    year: useRef(null),
  };

  /* ================= LOCAL STORAGE ================= */

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  /* ================= NOTIFICATION PERMISSION ================= */

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /* ================= HANDLERS ================= */

  const handleSelect = (key) => {
    setActiveSection(key);
    refs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= SWIPE HANDLERS ================= */

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) < 60) return;

    if (diff > 0 && !showTodo) {
      // swipe left → To-Do
      setShowTodo(true);
    }

    if (diff < 0 && showTodo) {
      // swipe right → Home
      setShowTodo(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="app">
      {/* ---------- TOP BAR ---------- */}
      <header className="top-bar">
        {showTodo ? "To-Do" : "Expense"}
      </header>

      {/* ---------- GLASS OVERLAY ---------- */}
      {dropdownOpen && <div className="glass-overlay" />}

      {/* ---------- CONTENT ---------- */}
      <main
        className="content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!showTodo ? (
          <>
            <ExpenseForm
              setExpenses={setExpenses}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />

            <div className={`below-form ${dropdownOpen ? "lowered" : ""}`}>
              <Summary
                expenses={expenses}
                onSelect={handleSelect}
                active={activeSection}
              />

              <ExpenseList
                expenses={expenses}
                refs={refs}
                active={activeSection}
              />
            </div>
          </>
        ) : (
          <Todo />
        )}
      </main>

      {/* ---------- BOTTOM NAV ---------- */}
      <BottomNav
        scrollToToday={() => handleSelect("today")}
        showTodo={showTodo}
        setShowTodo={setShowTodo}
      />
    </div>
  );
}
