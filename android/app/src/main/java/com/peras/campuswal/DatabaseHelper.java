package com.peras.campuswal;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    
    private static final String DATABASE_NAME = "campuswal.db";
    private static final int DATABASE_VERSION = 1;
    
    // Expenses table
    public static final String TABLE_EXPENSES = "expenses";
    public static final String COLUMN_EXPENSE_ID = "id";
    public static final String COLUMN_EXPENSE_ITEM = "item";
    public static final String COLUMN_EXPENSE_AMOUNT = "amount";
    public static final String COLUMN_EXPENSE_DATE = "date";
    public static final String COLUMN_EXPENSE_TIMESTAMP = "timestamp";
    
    // Todos table
    public static final String TABLE_TODOS = "todos";
    public static final String COLUMN_TODO_ID = "id";
    public static final String COLUMN_TODO_TITLE = "title";
    public static final String COLUMN_TODO_WHEN = "when_time";
    public static final String COLUMN_TODO_PRIORITY = "priority";
    public static final String COLUMN_TODO_DONE = "done";
    public static final String COLUMN_TODO_NOTIFIED = "notified";
    public static final String COLUMN_TODO_DONE_AT = "done_at";
    
    // Create table statements
    private static final String CREATE_EXPENSES_TABLE = 
        "CREATE TABLE " + TABLE_EXPENSES + " (" +
        COLUMN_EXPENSE_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
        COLUMN_EXPENSE_ITEM + " TEXT NOT NULL, " +
        COLUMN_EXPENSE_AMOUNT + " REAL NOT NULL, " +
        COLUMN_EXPENSE_DATE + " TEXT NOT NULL, " +
        COLUMN_EXPENSE_TIMESTAMP + " INTEGER NOT NULL" +
        ")";
    
    private static final String CREATE_TODOS_TABLE = 
        "CREATE TABLE " + TABLE_TODOS + " (" +
        COLUMN_TODO_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
        COLUMN_TODO_TITLE + " TEXT NOT NULL, " +
        COLUMN_TODO_WHEN + " INTEGER NOT NULL, " +
        COLUMN_TODO_PRIORITY + " TEXT NOT NULL, " +
        COLUMN_TODO_DONE + " INTEGER DEFAULT 0, " +
        COLUMN_TODO_NOTIFIED + " INTEGER DEFAULT 0, " +
        COLUMN_TODO_DONE_AT + " INTEGER DEFAULT 0" +
        ")";
    
    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_EXPENSES_TABLE);
        db.execSQL(CREATE_TODOS_TABLE);
    }
    
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_EXPENSES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_TODOS);
        onCreate(db);
    }
}