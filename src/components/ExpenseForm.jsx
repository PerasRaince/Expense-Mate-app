import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import { toast } from "../utils/toast";

const OPTIONS = ["Food", "Travel", "Books", "Other"];

export default function ExpenseForm({ onExpenseAdded, dropdownOpen, setDropdownOpen }) {
  const [type, setType] = useState("Food");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (open) {
        setOpen(false);
        setDropdownOpen(false);
      }
    };

    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open, setDropdownOpen]);

  const addExpense = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const item = type === "Other" ? custom.trim() : type;
      const expenseAmount = parseFloat(amount);
      
      // Validation
      if (!item) {
        toast.error('Please enter expense name');
        return;
      }
      
      if (!amount || isNaN(expenseAmount) || expenseAmount <= 0) {
        toast.error('Please enter valid amount');
        return;
      }

      const expense = {
        item,
        amount: expenseAmount,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      console.log('💰 Adding expense:', expense);
      
      const result = await storage.saveExpense(expense);
      
      if (result && result.success) {
        toast.success('Expense added successfully');
        
        // Clear form
        setAmount("");
        setCustom("");
        setType("Food");
        
        // Notify parent component
        if (onExpenseAdded) {
          onExpenseAdded();
        }
      } else {
        throw new Error('Failed to save expense');
      }
      
    } catch (error) {
      console.error('❌ Failed to add expense:', error);
      toast.error(`Failed to add expense: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    const newOpen = !open;
    setOpen(newOpen);
    setDropdownOpen(newOpen);
  };

  const handleOptionSelect = (opt, e) => {
    e.stopPropagation();
    setType(opt);
    setOpen(false);
    setDropdownOpen(false);
  };

  return (
    <div className={`glass-card expense-form ${open ? "raised" : ""}`}>
      <h3>Add Expense</h3>

      {/* Custom Dropdown */}
      <div className="dropdown">
        <button
          className="dropdown-btn"
          onClick={handleDropdownToggle}
          disabled={isSubmitting}
        >
          <span className="dropdown-value">{type}</span>
          <span className={`arrow ${open ? "up" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="dropdown-menu">
            {OPTIONS.map(opt => (
              <div
                key={opt}
                className={`dropdown-item ${opt === type ? "active" : ""}`}
                onClick={(e) => handleOptionSelect(opt, e)}
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
          disabled={isSubmitting}
        />
      )}

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={isSubmitting}
        step="0.01"
        min="0"
      />

      <button 
        onClick={addExpense}
        disabled={isSubmitting}
        className={isSubmitting ? 'submitting' : ''}
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </div>
  );
}
