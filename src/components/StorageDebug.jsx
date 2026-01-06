import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { storage } from '../utils/storage';

export default function StorageDebug() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [dataStats, setDataStats] = useState(null);

  useEffect(() => {
    const getInfo = async () => {
      try {
        // Get storage info
        const info = await storage.getStorageInfo();
        setStorageInfo(info);
        
        // Get permissions
        const perms = await storage.requestPermissions();
        setPermissions(perms);
        
        // Get data statistics
        const expenses = await storage.loadExpenses();
        const todos = await storage.loadTodos();
        setDataStats({
          expenseCount: expenses.length,
          todoCount: todos.length
        });
        
      } catch (error) {
        console.error('Debug info error:', error);
      }
    };

    getInfo();
  }, []);

  const handleExportData = async () => {
    try {
      const data = await storage.exportData();
      
      // Create downloadable file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // For mobile devices, try to use the native share API
      if (navigator.share && Capacitor.isNativePlatform()) {
        try {
          // Create a temporary file URL
          const url = URL.createObjectURL(blob);
          await navigator.share({
            title: 'CampusWal Backup',
            text: 'My expense and todo data backup',
            url: url
          });
          URL.revokeObjectURL(url);
          return;
        } catch (shareError) {
          console.log('Share API failed, using download fallback');
        }
      }
      
      // Fallback: Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campuswal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      await storage.clearAllData();
      window.location.reload();
    }
  };

  if (!storageInfo) return null;

  return (
    <div className="glass-card" style={{ fontSize: '12px', opacity: 0.8 }}>
      <h4>🔧 Storage Debug</h4>
      <p><strong>Type:</strong> {storageInfo.type}</p>
      <p><strong>Platform:</strong> {storageInfo.platform}</p>
      <p><strong>Native:</strong> {storageInfo.isNative ? '✅ Yes' : '❌ No'}</p>
      {permissions && (
        <p><strong>Permissions:</strong> {permissions.granted ? '✅ Granted' : '❌ Denied'}</p>
      )}
      {dataStats && (
        <div>
          <p><strong>Data:</strong> {dataStats.expenseCount} expenses, {dataStats.todoCount} todos</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleExportData}
          className="export-btn"
        >
          📤 Export Data
        </button>
        <button 
          onClick={handleClearData}
          style={{ 
            fontSize: '12px', 
            padding: '8px 12px', 
            height: 'auto',
            margin: '4px',
            background: 'rgba(255, 59, 48, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
}