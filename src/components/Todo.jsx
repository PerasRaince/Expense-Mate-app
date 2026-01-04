import { useState, useEffect } from "react";

export default function Todo() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("low");

  const [rescheduleTodo, setRescheduleTodo] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  /* ================= SAVE ================= */

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

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

  /* ================= ADD ================= */

  const addTodo = () => {
    if (!title || !date || !time) return;

    setTodos(prev => [
      {
        id: Date.now(),
        title,
        when: new Date(`${date}T${time}`).getTime(),
        priority,
        done: false,
        notified: false,
      },
      ...prev,
    ]);

    setTitle("");
    setDate("");
    setTime("");
    setPriority("low");
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

  /* ================= ACTIONS ================= */

  const markDone = (id) => {
    setTodos(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, done: true, doneAt: Date.now() }
          : t
      )
    );
  };

  const openReschedule = (todo) => {
    setRescheduleTodo(todo);
    setNewDate(new Date(todo.when).toISOString().slice(0, 10));
    setNewTime(new Date(todo.when).toTimeString().slice(0, 5));
  };

  const confirmReschedule = () => {
    setTodos(prev =>
      prev.map(t =>
        t.id === rescheduleTodo.id
          ? {
              ...t,
              when: new Date(`${newDate}T${newTime}`).getTime(),
              done: false,
              notified: false,
            }
          : t
      )
    );
    setRescheduleTodo(null);
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* ADD FORM */}
      <div className="glass-card todo-form">
        <h3>Schedule Task</h3>

        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />

        {/* PRIORITY PICKER */}
        <div className="priority-picker">
          {["low","medium","high"].map(p => (
            <span
              key={p}
              className={`priority-dot ${p} ${priority === p ? "active" : ""}`}
              onClick={() => setPriority(p)}
            />
          ))}
        </div>

        <button onClick={addTodo}>Schedule</button>
      </div>

      {/* LIST */}
      <div className="glass-card todo-list">
        <h3>Scheduled</h3>

        {todos.map(todo => (
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
