# Expense Mate

Expense Mate is a mobile-first expense and task management application built with React and Vite, designed with an iOS-style glassmorphism UI and packaged as a fullscreen Android app using Trusted Web Activity (TWA).

This project focuses on simplicity, offline usage, smooth interactions, and a native-app feel without a backend.

---

## Overview

Expense Mate helps users track daily expenses and manage scheduled tasks in a single lightweight application.  
All data is stored locally on the device, ensuring privacy, speed, and offline availability.

The interface adapts automatically to system light and dark themes and is optimized for touch-based mobile usage.

---

## Core Features

### Expense Tracking
- Add expenses with predefined categories and a custom option
- Automatic date and time logging
- Expenses stored in local storage (persistent on reload)
- View totals grouped by:
  - Today
  - Week
  - Month
  - Year
- Newest expenses appear at the top
- Smooth scrolling between summary sections
- Clean stacked list layout for better readability

### Task Scheduler (To-Do)
- Create tasks with specific date and time
- Priority levels with visual indicators
- Mark tasks as completed (faded appearance)
- Reschedule tasks using a modal popup
- Completed tasks are automatically removed after 21 days
- Notification support using the Web Notifications API

---

## User Interface

- iOS-inspired glassmorphism design
- Smooth transitions and subtle animations
- Bottom navigation for switching between Expense and To-Do views
- Swipe gestures for quick navigation
- Responsive layout optimized for mobile screens
- Automatic light and dark mode based on system settings

---

## Technology Stack

- React
- Vite
- Modern CSS (Glassmorphism UI)
- LocalStorage for persistence
- Web Notifications API
- Trusted Web Activity (Android)

---

## Data & Privacy

- No backend
- No external database
- No cloud sync
- All data is stored locally on the user’s device
- Fully offline capable

---

## Installation & Development

### Requirements
- Node.js (LTS)
- npm
- Git

### Run Locally
```bash
npm install
npm run dev






Project Structure


college-expense-tracker/
│
├─ src/
│  ├─ components/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
│
├─ index.html
├─ package.json
└─ README.md


