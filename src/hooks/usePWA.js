import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check if app is installed
    checkIfInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('📱 MILARI IA: Install prompt available');
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ MILARI IA: App installed successfully');
      
      // Track installation
      trackInstallation();
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 MILARI IA: Back online');
      
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('sync-tasks');
          registration.sync.register('sync-milari-conversations');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📱 MILARI IA: Working offline');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 MILARI IA: Service Worker registered:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              console.log('🔄 MILARI IA: Update available');
            }
          });
        });

        // Listen for controller change (new SW took over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('❌ MILARI IA: Service Worker registration failed:', error);
      }
    }
  };

  const checkIfInstalled = () => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('❌ MILARI IA: Install prompt not available');
      return false;
    }

    try {
      // Show install prompt
      deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ MILARI IA: User accepted install');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('❌ MILARI IA: User dismissed install');
        return false;
      }
    } catch (error) {
      console.error('❌ MILARI IA: Install failed:', error);
      return false;
    }
  };

  const updateApp = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Tell waiting SW to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateAvailable(false);
        }
      } catch (error) {
        console.error('❌ MILARI IA: Update failed:', error);
      }
    }
  };

  const trackInstallation = () => {
    // Track app installation for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'app_install', {
        event_category: 'PWA',
        event_label: 'MILARI IA'
      });
    }
    
    // Store installation date
    localStorage.setItem('milari_installed_date', new Date().toISOString());
    
    console.log('📊 MILARI IA: Installation tracked');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 MILARI IA: Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  };

  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe to push notifications
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY || 'default-key'
          });
        }
        
        console.log('📬 MILARI IA: Push subscription:', subscription);
        
        // Send subscription to server (cuando tengamos backend)
        // await fetch('/api/push/subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ subscription, userAgent: navigator.userAgent })
        // });
        
        return subscription;
      } catch (error) {
        console.error('❌ MILARI IA: Push subscription failed:', error);
        return null;
      }
    }
    return null;
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MILARI IA - Asistente Personal Inteligente',
          text: 'Conoce MILARI IA, tu asistente personal con inteligencia artificial',
          url: window.location.origin
        });
        return true;
      } catch (error) {
        console.log('Share canceled or failed:', error);
        return false;
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.origin);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  };

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    
    // Actions
    installApp,
    updateApp,
    requestNotificationPermission,
    subscribeToPushNotifications,
    shareApp
  };
};

export default usePWA;