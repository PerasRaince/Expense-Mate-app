import { Capacitor } from '@capacitor/core';

class StorageManager {
  constructor() {
    this.isInitialized = false;
    this.useNativeStorage = false;
    this.plugin = null;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔄 Initializing SQLite storage...');
      
      if (Capacitor.isNativePlatform()) {
        // Wait for Capacitor to be ready
        await Capacitor.Plugins;
        
        // Check if the plugin is available
        if (Capacitor.Plugins && Capacitor.Plugins.SQLiteStorage) {
          this.plugin = Capacitor.Plugins.SQLiteStorage;
          this.useNativeStorage = true;
          console.log('✅ SQLite storage initialized');
        } else {
          console.log('⚠️ SQLite plugin not available, using localStorage');
          this.useNativeStorage = false;
        }
      } else {
        this.useNativeStorage = false;
        console.log('🌐 Using localStorage for web platform');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      this.useNativeStorage = false;
      this.isInitialized = true;
    }
  }

  async saveExpense(expense) {
    try {
      await this.init();
      
      if (!expense || !expense.item || expense.amount === undefined) {
        throw new Error('Invalid expense data');
      }

      if (this.useNativeStorage && this.plugin) {
        const result = await this.plugin.saveExpense({
          item: expense.item,
          amount: expense.amount,
          date: expense.date || new Date().toISOString(),
          timestamp: expense.timestamp || Date.now()
        });
        console.log('💾 Expense saved to SQLite');
        return result;
      } else {
        // Web fallback
        const expenses = this.getLocalStorageExpenses();
        const newExpense = {
          id: Date.now(),
          ...expense,
          timestamp: expense.timestamp || Date.now()
        };
        expenses.unshift(newExpense);
        localStorage.setItem('campuswal_expenses', JSON.stringify(expenses));
        console.log('💾 Expense saved to localStorage');
        return { success: true, id: newExpense.id };
      }
    } catch (error) {
      console.error('❌ Failed to save expense:', error);
      throw error;
    }
  }

  async getExpenses(searchQuery = '', timeFilter = 'all') {
    try {
      await this.init();
      
      if (this.useNativeStorage && this.plugin) {
        const result = await this.plugin.getExpenses({
          search: searchQuery,
          timeFilter: timeFilter
        });
        console.log('📂 Expenses loaded from SQLite');
        return {
          expenses: result.expenses || [],
          total: result.total || 0,
          count: result.count || 0
        };
      } else {
        // Web fallback
        let expenses = this.getLocalStorageExpenses();
        
        // Apply search filter
        if (searchQuery) {
          expenses = expenses.filter(expense => 
            expense.item.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply time filter
        const timeLimit = this.getTimeLimit(timeFilter);
        if (timeLimit > 0) {
          expenses = expenses.filter(expense => 
            (expense.timestamp || 0) >= timeLimit
          );
        }
        
        const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        
        console.log('📂 Expenses loaded from localStorage');
        return {
          expenses: expenses,
          total: total,
          count: expenses.length
        };
      }
    } catch (error) {
      console.error('❌ Failed to load expenses:', error);
      return { expenses: [], total: 0, count: 0 };
    }
  }

  async saveTodo(todo) {
    try {
      await this.init();
      
      if (!todo || !todo.title || !todo.when) {
        throw new Error('Invalid todo data');
      }

      if (this.useNativeStorage && this.plugin) {
        const result = await this.plugin.saveTodo({
          title: todo.title,
          when: todo.when,
          priority: todo.priority || 'low'
        });
        console.log('💾 Todo saved to SQLite');
        return result;
      } else {
        // Web fallback
        const todos = this.getLocalStorageTodos();
        const newTodo = {
          id: Date.now(),
          ...todo,
          done: false,
          notified: false
        };
        todos.unshift(newTodo);
        localStorage.setItem('campuswal_todos', JSON.stringify(todos));
        console.log('💾 Todo saved to localStorage');
        return { success: true, id: newTodo.id };
      }
    } catch (error) {
      console.error('❌ Failed to save todo:', error);
      throw error;
    }
  }

  async getTodos() {
    try {
      await this.init();
      
      if (this.useNativeStorage && this.plugin) {
        const result = await this.plugin.getTodos();
        console.log('📂 Todos loaded from SQLite');
        return result.todos || [];
      } else {
        // Web fallback
        const todos = this.getLocalStorageTodos();
        console.log('📂 Todos loaded from localStorage');
        return todos;
      }
    } catch (error) {
      console.error('❌ Failed to load todos:', error);
      return [];
    }
  }

  async updateTodo(id, updates) {
    try {
      await this.init();
      
      if (this.useNativeStorage && this.plugin) {
        const result = await this.plugin.updateTodo({
          id: id,
          ...updates
        });
        console.log('✅ Todo updated in SQLite');
        return result;
      } else {
        // Web fallback
        const todos = this.getLocalStorageTodos();
        const index = todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
          todos[index] = { ...todos[index], ...updates };
          localStorage.setItem('campuswal_todos', JSON.stringify(todos));
          console.log('✅ Todo updated in localStorage');
          return { success: true };
        }
        throw new Error('Todo not found');
      }
    } catch (error) {
      console.error('❌ Failed to update todo:', error);
      throw error;
    }
  }

  // Helper methods for localStorage fallback
  getLocalStorageExpenses() {
    try {
      const data = localStorage.getItem('campuswal_expenses');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to parse localStorage expenses');
      return [];
    }
  }

  getLocalStorageTodos() {
    try {
      const data = localStorage.getItem('campuswal_todos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to parse localStorage todos');
      return [];
    }
  }

  getTimeLimit(timeFilter) {
    const now = Date.now();
    switch (timeFilter) {
      case 'today':
        return now - (24 * 60 * 60 * 1000); // 24 hours ago
      case 'week':
        return now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      case 'month':
        return now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      case 'year':
        return now - (365 * 24 * 60 * 60 * 1000); // 365 days ago
      default:
        return 0; // No time limit
    }
  }

  async getStorageInfo() {
    await this.init();
    
    return {
      type: this.useNativeStorage ? 'SQLite Database' : 'Browser Storage',
      location: this.useNativeStorage ? 'Android SQLite' : 'localStorage',
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      hasPermissions: true,
      canWrite: true
    };
  }

  async exportData() {
    try {
      const expensesResult = await this.getExpenses();
      const todos = await this.getTodos();
      
      return {
        expenses: expensesResult.expenses || [],
        todos: todos || [],
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      return {
        expenses: [],
        todos: [],
        exportDate: new Date().toISOString(),
        version: '2.0',
        error: error.message
      };
    }
  }

  async clearAllData() {
    try {
      // Clear localStorage
      localStorage.removeItem('campuswal_expenses');
      localStorage.removeItem('campuswal_todos');
      
      console.log('🗑️ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      return false;
    }
  }
}

export const storage = new StorageManager();