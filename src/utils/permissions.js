import { Capacitor } from '@capacitor/core';

class PermissionManager {
  constructor() {
    this.permissionsGranted = false;
  }

  async requestPermissions() {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('🌐 Web platform - no permissions needed');
        this.permissionsGranted = true;
        return true;
      }

      console.log('📱 Requesting Android permissions...');

      // Request notification permission for Android 13+
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
        }
      }

      // For Android, we'll use the native plugin to request storage permissions
      if (Capacitor.Plugins && Capacitor.Plugins.SQLiteStorage) {
        try {
          // The SQLite plugin handles internal storage automatically
          console.log('✅ SQLite storage permissions handled by plugin');
        } catch (error) {
          console.error('❌ Failed to initialize SQLite:', error);
        }
      }

      this.permissionsGranted = true;
      return true;

    } catch (error) {
      console.error('❌ Permission request failed:', error);
      this.permissionsGranted = false;
      return false;
    }
  }

  async checkPermissions() {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true;
      }

      // Check notification permission
      if ('Notification' in window) {
        const permission = Notification.permission;
        console.log('🔔 Notification permission:', permission);
        return permission === 'granted';
      }

      return true;
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      return false;
    }
  }

  showPermissionDialog() {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'permission-dialog-overlay';
      dialog.innerHTML = `
        <div class="permission-dialog">
          <div class="permission-icon">🔐</div>
          <h3>Permissions Required</h3>
          <p>CampusWal needs the following permissions to work properly:</p>
          <ul>
            <li>📱 <strong>Storage Access</strong> - To save your expenses and todos</li>
            <li>🔔 <strong>Notifications</strong> - To remind you about scheduled tasks</li>
          </ul>
          <p>Your data stays private and secure on your device.</p>
          <div class="permission-buttons">
            <button class="permission-btn allow">Allow Permissions</button>
            <button class="permission-btn deny">Not Now</button>
          </div>
        </div>
      `;

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .permission-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        
        .permission-dialog {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          max-width: 320px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .permission-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .permission-dialog h3 {
          margin: 0 0 16px 0;
          color: #000;
          font-size: 20px;
          font-weight: 600;
        }
        
        .permission-dialog p {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .permission-dialog ul {
          text-align: left;
          margin: 16px 0;
          padding-left: 0;
          list-style: none;
        }
        
        .permission-dialog li {
          margin: 8px 0;
          color: #333;
          font-size: 14px;
        }
        
        .permission-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        
        .permission-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .permission-btn.allow {
          background: linear-gradient(180deg, #007aff, #0056cc);
          color: white;
        }
        
        .permission-btn.deny {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }
        
        .permission-btn:active {
          transform: scale(0.95);
        }
        
        @media (prefers-color-scheme: dark) {
          .permission-dialog {
            background: rgba(40, 40, 40, 0.95);
          }
          
          .permission-dialog h3,
          .permission-dialog p,
          .permission-dialog li {
            color: #fff;
          }
          
          .permission-btn.deny {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(dialog);

      const allowBtn = dialog.querySelector('.allow');
      const denyBtn = dialog.querySelector('.deny');

      allowBtn.onclick = () => {
        document.body.removeChild(dialog);
        document.head.removeChild(style);
        resolve(true);
      };

      denyBtn.onclick = () => {
        document.body.removeChild(dialog);
        document.head.removeChild(style);
        resolve(false);
      };
    });
  }
}

export const permissions = new PermissionManager();