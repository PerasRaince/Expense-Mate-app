import { useState } from "react";

const OPTIONS = ["Food", "Travel", "Books", "Other"];

export default function ExpenseForm({ setExpenses, setDropdownOpen }) {
  const [type, setType] = useState("Food");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState("");

  const addExpense = () => {
    const item = type === "Other" ? custom.trim() : type;
    if (!item || !amount) return;

    setExpenses(prev => [
      ...prev,
      { item, amount: Number(amount), date: new Date().toISOString() }
    ]);

    setAmount("");
    setCustom("");
    setType("Food");
  };

  return (
<div className={`glass-card expense-form ${open ? "raised" : ""}`}>
      <h3>Add Expense</h3>

      {/* Custom Dropdown */}
      <div className="dropdown">
        <button
          className="dropdown-btn"
onClick={() => {
  setOpen(o => !o);
  setDropdownOpen(true);
}}
        >
          {type}
          <span className={`arrow ${open ? "up" : ""}`}>v</span>
        </button>

        {open && (
          <div className="dropdown-menu">
            {OPTIONS.map(opt => (
              <div
                key={opt}
                className={`dropdown-item ${opt === type ? "active" : ""}`}
                onClick={() => {
  setType(opt);
  setOpen(false);
  setDropdownOpen(false);
}}

              
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {type === "Other" && (
        <input
          placeholder="Expense name"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
      )}

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <button onClick={addExpense}>Add</button>
    </div>
  );
}
