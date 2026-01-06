import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import { toast } from "../utils/toast";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("low");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rescheduleTodo, setRescheduleTodo] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  /* ================= LOAD TODOS SAFELY ================= */

  useEffect(() => {
    const loadTodos = async () => {
      try {
        console.log('📂 Loading todos...');
        const loadedTodos = await storage.getTodos();
        console.log('📂 Loaded todos:', loadedTodos?.length || 0);
        setTodos(Array.isArray(loadedTodos) ? loadedTodos : []);
      } catch (error) {
        console.error('❌ Failed to load todos:', error);
        toast.error('Failed to load tasks');
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  /* ================= AUTO REMOVE DONE (21 DAYS) ================= */

  useEffect(() => {
    const now = Date.now();
    const limit = 21 * 24 * 60 * 60 * 1000;

    setTodos(prev =>
      prev.filter(t =>
        !t.done || (now - t.doneAt) < limit
      )
    );
  }, []);

  /* ================= ADD TODO WITH BETTER ERROR HANDLING ================= */

  const addTodo = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('➕ Adding todo...');
      
      // Validate inputs
      if (!title || title.trim().length === 0) {
        toast.error('Please enter a task title');
        return;
      }
      
      if (!date) {
        toast.error('Please select a date');
        return;
      }
      
      if (!time) {
        toast.error('Please select a time');
        return;
      }

      // Create new todo object
      const newTodo = {
        title: title.trim(),
        when: new Date(`${date}T${time}`).getTime(),
        priority: priority || 'low'
      };

      console.log('📝 Creating todo:', newTodo);
      
      // Save to SQLite database
      const result = await storage.saveTodo(newTodo);
      
      if (result && result.success) {
        toast.success('Task scheduled successfully');
        
        // Reload todos from database to get the updated list with IDs
        const updatedTodos = await storage.getTodos();
        setTodos(Array.isArray(updatedTodos) ? updatedTodos : []);
        
        // Clear form
        setTitle("");
        setDate("");
        setTime("");
        setPriority("low");
        
        console.log('✅ Todo added successfully');
      } else {
        throw new Error('Failed to save task to database');
      }
      
    } catch (error) {
      console.error('❌ Failed to add todo:', error);
      toast.error(`Failed to add task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= REMINDERS ================= */

  useEffect(() => {
    const check = () => {
      const now = Date.now();

      setTodos(prev =>
        prev.map(todo => {
          if (!todo.done && !todo.notified && now >= todo.when) {
            if (Notification.permission === "granted") {
              new Notification("⏰ Reminder", { body: todo.title });
            }
            navigator.vibrate?.([150, 100, 150]);
            return { ...todo, notified: true };
          }
          return todo;
        })
      );
    };

    check();
    const i = setInterval(check, 5000);
    window.addEventListener("focus", check);

    return () => {
      clearInterval(i);
      window.removeEventListener("focus", check);
    };
  }, []);

  /* ================= ACTIONS WITH ERROR HANDLING ================= */

  const markDone = async (id) => {
    try {
      const result = await storage.updateTodo(id, { 
        done: true, 
        doneAt: Date.now() 
      });
      
      if (result && result.success) {
        toast.success('Task completed');
        // Reload todos from database
        const updatedTodos = await storage.getTodos();
        setTodos(Array.isArray(updatedTodos) ? updatedTodos : []);
      } else {
        throw new Error('Failed to update task in database');
      }
    } catch (error) {
      console.error('❌ Failed to mark todo as done:', error);
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  const openReschedule = (todo) => {
    try {
      setRescheduleTodo(todo);
      setNewDate(new Date(todo.when).toISOString().slice(0, 10));
      setNewTime(new Date(todo.when).toTimeString().slice(0, 5));
    } catch (error) {
      console.error('❌ Failed to open reschedule:', error);
      toast.error('Failed to open reschedule dialog');
    }
  };

  const confirmReschedule = async () => {
    try {
      if (!newDate || !newTime) {
        toast.error('Please select date and time');
        return;
      }

      const newWhen = new Date(`${newDate}T${newTime}`).getTime();
      const result = await storage.updateTodo(rescheduleTodo.id, {
        when: newWhen,
        done: false,
        notified: false
      });

      if (result && result.success) {
        toast.success('Task rescheduled successfully');
        // Reload todos from database
        const updatedTodos = await storage.getTodos();
        setTodos(Array.isArray(updatedTodos) ? updatedTodos : []);
        setRescheduleTodo(null);
      } else {
        throw new Error('Failed to update task in database');
      }
    } catch (error) {
      console.error('❌ Failed to reschedule todo:', error);
      toast.error('Failed to reschedule task');
    }
  };

  /* ================= RENDER ================= */

  if (isLoading) {
    return (
      <div className="glass-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ADD FORM */}
      <div className="glass-card todo-form">
        <h3>Schedule Task</h3>

        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isSubmitting}
        />

        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)}
          disabled={isSubmitting}
        />
        <input 
          type="time" 
          value={time} 
          onChange={e => setTime(e.target.value)}
          disabled={isSubmitting}
        />

        {/* PRIORITY PICKER */}
        <div className="priority-picker">
          {["low","medium","high"].map(p => (
            <span
              key={p}
              className={`priority-dot ${p} ${priority === p ? "active" : ""}`}
              onClick={() => !isSubmitting && setPriority(p)}
            />
          ))}
        </div>

        <button 
          onClick={addTodo}
          disabled={isSubmitting}
          className={isSubmitting ? 'submitting' : ''}
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule'}
        </button>
      </div>

      {/* LIST */}
      <div className="glass-card todo-list">
        <h3>Scheduled</h3>

        {(Array.isArray(todos) ? todos : []).map(todo => (
          <div key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
            {/* CORNER BADGE */}
            <span className={`priority-corner ${todo.priority}`} />

            <div className="todo-content">
              <b>{todo.title}</b>
              <div className="todo-time">
                {new Date(todo.when).toLocaleString()}
              </div>
            </div>

            {!todo.done && (
              <div className="todo-actions">
                <button onClick={() => markDone(todo.id)}>✓</button>
                <button onClick={() => openReschedule(todo)}>↻</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleTodo && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Reschedule</h3>

            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />

            <button onClick={confirmReschedule}>Save</button>
            <button className="cancel" onClick={() => setRescheduleTodo(null)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}