import { useState, useEffect, useRef } from "react";

import ExpenseForm from "./components/ExpenseForm";
import SearchBar from "./components/SearchBar";
import Summary from "./components/Summary";
import ExpenseList from "./components/ExpenseList";
import BottomNav from "./components/BottomNav";
import Todo from "./components/Todo";
import StorageDebug from "./components/StorageDebug";
import { storage } from "./utils/storage";
import { permissions } from "./utils/permissions";
import { toast } from "./utils/toast";

export default function App() {
  /* ================= EXPENSE STATE ================= */

  const [expenses, setExpenses] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  /* ================= UI STATE ================= */

  const [showTodo, setShowTodo] = useState(false);
  const [activeSection, setActiveSection] = useState("today");
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

  /* ================= LOAD EXPENSES ================= */

  const loadExpenses = async (search = searchQuery, filter = timeFilter) => {
    try {
      const result = await storage.getExpenses(search, filter);
      setExpenses(result.expenses || []);
      
      if (search) {
        setSearchResults({
          expenses: result.expenses || [],
          count: result.count || 0,
          total: result.total || 0
        });
      } else {
        setSearchResults(null);
      }
    } catch (error) {
      console.error('❌ Failed to load expenses:', error);
      toast.error('Failed to load expenses');
      setExpenses([]);
      setSearchResults(null);
    }
  };

  /* ================= INITIALIZE APP ================= */

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        setIsLoading(true);
        
        // Request permissions first
        const userWantsPermissions = await permissions.showPermissionDialog();
        if (userWantsPermissions) {
          await permissions.requestPermissions();
        }
        
        // Initialize storage
        await storage.init();
        
        // Load initial expenses
        await loadExpenses();
        
        // Get storage info for debugging
        try {
          const storageInfo = await storage.getStorageInfo();
          console.log('📱 Storage Info:', storageInfo);
        } catch (error) {
          console.error('❌ Failed to get storage info:', error);
        }
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setExpenses([]);
      } finally {
        setIsLoading(false);
        console.log('✅ App initialization completed');
      }
    };

    initializeApp();
  }, []);

  /* ================= NOTIFICATION PERMISSION ================= */

  // Remove the old notification permission request since it's handled by permissions manager

  /* ================= GLOBAL ERROR CATCHER ================= */

  useEffect(() => {
    window.onerror = function (msg, url, line, col, error) {
      console.error("Global error:", msg, error);
    };
  }, []);

  /* ================= HANDLERS ================= */

  const handleSelect = (key) => {
    setActiveSection(key);
    refs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= SWIPE HANDLERS WITH BETTER CONTROL ================= */

  const handleTouchStart = (e) => {
    if (dropdownOpen) return; // Don't handle swipes when dropdown is open
    
    // Only handle swipes on the main content area, not on buttons or inputs
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      return;
    }
    
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (dropdownOpen) return; // Don't handle swipes when dropdown is open
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (dropdownOpen) return; // Don't handle swipes when dropdown is open
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 150; // Increased threshold to prevent accidental swipes
    const minSwipeDistance = Math.abs(diff);

    // Only trigger swipe if the movement is significant enough
    if (minSwipeDistance < threshold) return;

    // Prevent swipes on small movements or when user is scrolling vertically
    const startY = touchStartX.current;
    const endY = touchEndX.current;
    const verticalMovement = Math.abs(startY - endY);
    
    // If vertical movement is too much, it's probably a scroll, not a swipe
    if (verticalMovement > 100) return;

    // Only allow deliberate horizontal swipes
    if (minSwipeDistance < 150) return;

    // Swipe left (show todo) - only from expense screen
    if (diff > 0 && !showTodo) {
      console.log('👈 Swiping to Todo');
      setShowTodo(true);
    }

    // Swipe right (show expense) - only from todo screen
    if (diff < 0 && showTodo) {
      console.log('👉 Swiping to Expense');
      setShowTodo(false);
    }
  };

  /* ================= SEARCH HANDLERS ================= */

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadExpenses(query, timeFilter);
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setActiveSection(filter === 'all' ? 'today' : filter);
    loadExpenses(searchQuery, filter);
  };

  const handleExpenseAdded = () => {
    // Reload expenses after adding new one
    loadExpenses(searchQuery, timeFilter);
  };

  /* ================= NAVIGATION HANDLERS ================= */

  const handleNavToExpense = () => {
    console.log('🧾 Navigating to Expense');
    setShowTodo(false);
    setDropdownOpen(false);
  };

  const handleNavToTodo = () => {
    console.log('📋 Navigating to Todo');
    setShowTodo(true);
    setDropdownOpen(false);
  };

  /* ================= RENDER ================= */

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading CampusWal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ---------- TOP BAR ---------- */}
      <header className="top-bar">
        {showTodo ? "To-Do" : "Expense Tracker"}
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
              onExpenseAdded={handleExpenseAdded}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />

            <div className={`below-form ${dropdownOpen ? "lowered" : ""}`}>
              <Summary
                expenses={expenses}
                onSelect={handleSelect}
                active={activeSection}
                searchResults={searchResults}
              />

              <SearchBar
                onSearch={handleSearch}
                onTimeFilterChange={handleTimeFilterChange}
                activeTimeFilter={timeFilter}
                searchResults={searchResults}
              />

              <ExpenseList
                expenses={expenses}
                refs={refs}
                active={activeSection}
                searchQuery={searchQuery}
                searchResults={searchResults}
              />
              
              <StorageDebug />
            </div>
          </>
        ) : (
          <>
            <Todo />
            <StorageDebug />
          </>
        )}
      </main>

      {/* ---------- BOTTOM NAV ---------- */}
      <BottomNav
        scrollToToday={() => handleSelect("today")}
        showTodo={showTodo}
        onExpenseClick={handleNavToExpense}
        onTodoClick={handleNavToTodo}
      />
    </div>
  );
}
