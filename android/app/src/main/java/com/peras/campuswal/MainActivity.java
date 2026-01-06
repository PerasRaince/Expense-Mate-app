package com.peras.campuswal;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register our custom SQLite storage plugin
        registerPlugin(SQLiteStoragePlugin.class);
    }
}
