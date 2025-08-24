// Service Worker Registration for Monetag Push Notifications

export const registerServiceWorker = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return true;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Subscribe to push notifications
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Monetag will provide their own applicationServerKey if needed
        });
        
        console.log('Push subscription successful:', subscription);
        return true;
      } catch (subscribeError) {
        console.log('Failed to subscribe to push notifications:', subscribeError);
        return false;
      }
    } else {
      console.log('Notification permission denied');
      return false;
    }

  } catch (error) {
    console.error('Service worker registration failed:', error);
    return false;
  }
};

// Function to unregister service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service worker unregistered');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unregistering service worker:', error);
    return false;
  }
};

// Check if service worker is registered
export const isServiceWorkerRegistered = (): boolean => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  return navigator.serviceWorker.controller !== null;
};

// Get current push subscription
export const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.pushManager.getSubscription();
    }
    return null;
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};
