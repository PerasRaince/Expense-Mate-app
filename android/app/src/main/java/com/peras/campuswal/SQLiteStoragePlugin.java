package com.peras.campuswal;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.widget.Toast;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import android.app.AlarmManager;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

@CapacitorPlugin(name = "SQLiteStorage")
public class SQLiteStoragePlugin extends Plugin {

    private DatabaseHelper dbHelper;
    private static final String CHANNEL_ID = "campuswal_todos";
    private static final String CHANNEL_NAME = "Todo Reminders";
    private static final String CHANNEL_DESCRIPTION = "Notifications for scheduled todos";

    @Override
    public void load() {
        dbHelper = new DatabaseHelper(getContext());
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(CHANNEL_DESCRIPTION);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 250, 250, 250});
            
            NotificationManager notificationManager = getContext().getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @PluginMethod
    public void saveExpense(PluginCall call) {
        try {
            String item = call.getString("item");
            Double amount = call.getDouble("amount");
            String date = call.getString("date");
            Long timestamp = call.getLong("timestamp");

            if (item == null || amount == null || date == null || timestamp == null) {
                showToast("Missing expense data", false);
                call.reject("Missing required fields");
                return;
            }

            SQLiteDatabase db = dbHelper.getWritableDatabase();
            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COLUMN_EXPENSE_ITEM, item);
            values.put(DatabaseHelper.COLUMN_EXPENSE_AMOUNT, amount);
            values.put(DatabaseHelper.COLUMN_EXPENSE_DATE, date);
            values.put(DatabaseHelper.COLUMN_EXPENSE_TIMESTAMP, timestamp);

            long id = db.insert(DatabaseHelper.TABLE_EXPENSES, null, values);
            
            if (id != -1) {
                showToast("Expense saved successfully!", true);
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("id", id);
                call.resolve(result);
            } else {
                showToast("Failed to save expense", false);
                call.reject("Failed to insert expense");
            }
        } catch (Exception e) {
            showToast("Error saving expense: " + e.getMessage(), false);
            call.reject("Error saving expense: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getExpenses(PluginCall call) {
        try {
            String searchQuery = call.getString("search", "");
            String timeFilter = call.getString("timeFilter", "all");
            
            SQLiteDatabase db = dbHelper.getReadableDatabase();
            
            String selection = "";
            String[] selectionArgs = null;
            
            // Build search query
            if (!searchQuery.isEmpty()) {
                selection = DatabaseHelper.COLUMN_EXPENSE_ITEM + " LIKE ?";
                selectionArgs = new String[]{"%" + searchQuery + "%"};
            }
            
            // Add time filter
            long timeLimit = getTimeLimit(timeFilter);
            if (timeLimit > 0) {
                if (!selection.isEmpty()) {
                    selection += " AND ";
                }
                selection += DatabaseHelper.COLUMN_EXPENSE_TIMESTAMP + " >= ?";
                
                if (selectionArgs != null) {
                    String[] newArgs = new String[selectionArgs.length + 1];
                    System.arraycopy(selectionArgs, 0, newArgs, 0, selectionArgs.length);
                    newArgs[selectionArgs.length] = String.valueOf(timeLimit);
                    selectionArgs = newArgs;
                } else {
                    selectionArgs = new String[]{String.valueOf(timeLimit)};
                }
            }
            
            Cursor cursor = db.query(
                DatabaseHelper.TABLE_EXPENSES,
                null,
                selection,
                selectionArgs,
                null,
                null,
                DatabaseHelper.COLUMN_EXPENSE_TIMESTAMP + " DESC"
            );

            JSArray expenses = new JSArray();
            double totalAmount = 0;
            
            while (cursor.moveToNext()) {
                JSObject expense = new JSObject();
                expense.put("id", cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_ID)));
                expense.put("item", cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_ITEM)));
                expense.put("amount", cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_AMOUNT)));
                expense.put("date", cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_DATE)));
                expense.put("timestamp", cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_TIMESTAMP)));
                
                expenses.put(expense);
                totalAmount += cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_EXPENSE_AMOUNT));
            }
            cursor.close();

            JSObject result = new JSObject();
            result.put("expenses", expenses);
            result.put("total", totalAmount);
            result.put("count", expenses.length());
            call.resolve(result);
            
        } catch (Exception e) {
            call.reject("Error getting expenses: " + e.getMessage());
        }
    }

    @PluginMethod
    public void saveTodo(PluginCall call) {
        try {
            String title = call.getString("title");
            Long when = call.getLong("when");
            String priority = call.getString("priority");

            if (title == null || when == null || priority == null) {
                showToast("Missing todo data", false);
                call.reject("Missing required fields");
                return;
            }

            SQLiteDatabase db = dbHelper.getWritableDatabase();
            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COLUMN_TODO_TITLE, title);
            values.put(DatabaseHelper.COLUMN_TODO_WHEN, when);
            values.put(DatabaseHelper.COLUMN_TODO_PRIORITY, priority);
            values.put(DatabaseHelper.COLUMN_TODO_DONE, 0);
            values.put(DatabaseHelper.COLUMN_TODO_NOTIFIED, 0);

            long id = db.insert(DatabaseHelper.TABLE_TODOS, null, values);
            
            if (id != -1) {
                showToast("Todo saved successfully!", true);
                
                // Schedule notification
                scheduleNotification(title, when, (int) id);
                
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("id", id);
                call.resolve(result);
            } else {
                showToast("Failed to save todo", false);
                call.reject("Failed to insert todo");
            }
        } catch (Exception e) {
            showToast("Error saving todo: " + e.getMessage(), false);
            call.reject("Error saving todo: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getTodos(PluginCall call) {
        try {
            SQLiteDatabase db = dbHelper.getReadableDatabase();
            
            Cursor cursor = db.query(
                DatabaseHelper.TABLE_TODOS,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COLUMN_TODO_WHEN + " ASC"
            );

            JSArray todos = new JSArray();
            
            while (cursor.moveToNext()) {
                JSObject todo = new JSObject();
                todo.put("id", cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_ID)));
                todo.put("title", cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_TITLE)));
                todo.put("when", cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_WHEN)));
                todo.put("priority", cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_PRIORITY)));
                todo.put("done", cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_DONE)) == 1);
                todo.put("notified", cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_NOTIFIED)) == 1);
                todo.put("doneAt", cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TODO_DONE_AT)));
                
                todos.put(todo);
            }
            cursor.close();

            JSObject result = new JSObject();
            result.put("todos", todos);
            call.resolve(result);
            
        } catch (Exception e) {
            call.reject("Error getting todos: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateTodo(PluginCall call) {
        try {
            Long id = call.getLong("id");
            Boolean done = call.getBoolean("done");
            Long doneAt = call.getLong("doneAt");
            Long when = call.getLong("when");

            SQLiteDatabase db = dbHelper.getWritableDatabase();
            ContentValues values = new ContentValues();
            
            if (done != null) {
                values.put(DatabaseHelper.COLUMN_TODO_DONE, done ? 1 : 0);
                
                // Cancel notification if todo is marked as done
                if (done) {
                    cancelNotification(id.intValue());
                }
            }
            if (doneAt != null) {
                values.put(DatabaseHelper.COLUMN_TODO_DONE_AT, doneAt);
            }
            if (when != null) {
                values.put(DatabaseHelper.COLUMN_TODO_WHEN, when);
                values.put(DatabaseHelper.COLUMN_TODO_NOTIFIED, 0); // Reset notification status
                
                // Reschedule notification with new time
                String title = getTodoTitle(db, id);
                if (title != null) {
                    scheduleNotification(title, when, id.intValue());
                }
            }

            int rowsAffected = db.update(
                DatabaseHelper.TABLE_TODOS,
                values,
                DatabaseHelper.COLUMN_TODO_ID + " = ?",
                new String[]{String.valueOf(id)}
            );

            if (rowsAffected > 0) {
                showToast("Todo updated successfully!", true);
                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);
            } else {
                showToast("Failed to update todo", false);
                call.reject("Failed to update todo");
            }
        } catch (Exception e) {
            showToast("Error updating todo: " + e.getMessage(), false);
            call.reject("Error updating todo: " + e.getMessage());
        }
    }

    private String getTodoTitle(SQLiteDatabase db, Long id) {
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_TODOS,
            new String[]{DatabaseHelper.COLUMN_TODO_TITLE},
            DatabaseHelper.COLUMN_TODO_ID + " = ?",
            new String[]{String.valueOf(id)},
            null, null, null
        );
        
        if (cursor.moveToFirst()) {
            String title = cursor.getString(0);
            cursor.close();
            return title;
        }
        cursor.close();
        return null;
    }

    private long getTimeLimit(String timeFilter) {
        long now = System.currentTimeMillis();
        switch (timeFilter) {
            case "today":
                return now - (24 * 60 * 60 * 1000); // 24 hours ago
            case "week":
                return now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
            case "month":
                return now - (30L * 24 * 60 * 60 * 1000); // 30 days ago
            case "year":
                return now - (365L * 24 * 60 * 60 * 1000); // 365 days ago
            default:
                return 0; // No time limit
        }
    }

    private void showToast(String message, boolean isSuccess) {
        getActivity().runOnUiThread(() -> {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
        });
    }

    private void scheduleNotification(String title, long when, int todoId) {
        try {
            long currentTime = System.currentTimeMillis();
            
            // Only schedule if the time is in the future
            if (when <= currentTime) {
                android.util.Log.d("CampusWal", "Todo time is in the past, not scheduling notification");
                return;
            }
            
            AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            
            Intent intent = new Intent(getContext(), TodoNotificationReceiver.class);
            intent.putExtra("todo_title", title);
            intent.putExtra("todo_id", todoId);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(),
                todoId, // Use todoId as request code to make it unique
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Schedule the alarm
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, when, pendingIntent);
            }
            
            android.util.Log.d("CampusWal", "Scheduled notification for: " + title + " at " + when);
            
        } catch (Exception e) {
            android.util.Log.e("CampusWal", "Failed to schedule notification: " + e.getMessage());
        }
    }

    private void cancelNotification(int todoId) {
        try {
            AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            
            Intent intent = new Intent(getContext(), TodoNotificationReceiver.class);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(),
                todoId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            alarmManager.cancel(pendingIntent);
            android.util.Log.d("CampusWal", "Cancelled notification for todo ID: " + todoId);
            
        } catch (Exception e) {
            android.util.Log.e("CampusWal", "Failed to cancel notification: " + e.getMessage());
        }
    }

    // Broadcast receiver for handling scheduled notifications
    public static class TodoNotificationReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String todoTitle = intent.getStringExtra("todo_title");
            int todoId = intent.getIntExtra("todo_id", 0);
            
            showNotification(context, todoTitle, todoId);
        }
        
        private void showNotification(Context context, String title, int todoId) {
            try {
                Intent appIntent = new Intent(context, MainActivity.class);
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                
                PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    todoId,
                    appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                
                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info) // You can replace with your app icon
                    .setContentTitle("⏰ Todo Reminder")
                    .setContentText(title)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setDefaults(NotificationCompat.DEFAULT_ALL)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent)
                    .setVibrate(new long[]{0, 250, 250, 250});
                
                NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
                notificationManager.notify(todoId, builder.build());
                
                android.util.Log.d("CampusWal", "Notification shown for: " + title);
                
            } catch (Exception e) {
                android.util.Log.e("CampusWal", "Failed to show notification: " + e.getMessage());
            }
        }
    }
}