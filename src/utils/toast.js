class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 90%;
        width: 320px;
      }

      .toast {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 16px 20px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.3);
        
        display: flex;
        align-items: center;
        gap: 12px;
        
        font-size: 14px;
        font-weight: 500;
        color: #000;
        
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto;
      }

      .toast.show {
        transform: translateY(0);
        opacity: 1;
      }

      .toast.success {
        border-left: 4px solid #34c759;
      }

      .toast.error {
        border-left: 4px solid #ff3b30;
      }

      .toast.info {
        border-left: 4px solid #007aff;
      }

      .toast-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 16px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
      }

      .toast-close:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      @media (prefers-color-scheme: dark) {
        .toast {
          background: rgba(40, 40, 40, 0.95);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .toast-close {
          color: #ccc;
        }
        
        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      @media (max-width: 480px) {
        .toast-container {
          top: 80px;
          left: 16px;
          right: 16px;
          transform: none;
          width: auto;
          max-width: none;
        }
      }
    `;
    
    if (!document.head.querySelector('#toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">×</button>
    `;

    // Add to container
    this.container.appendChild(toast);

    // Close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => this.hide(toast);

    // Show animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto hide
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }

    return toast;
  }

  hide(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getIcon(type) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();