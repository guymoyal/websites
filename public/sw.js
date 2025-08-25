// Monetag Service Worker for Push Notifications
// Zone: 9768324

const CACHE_NAME = 'monetag-sw-v1';

// Install event
self.addEventListener('install', function(event) {
    console.log('🟢 Monetag SW installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
    console.log('🟢 Monetag SW activated');
    event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener('push', function(event) {
    console.log('🟢 Push received:', event);
    
    if (!event.data) {
        return;
    }
    
    try {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Click to view more',
            icon: data.icon || '/favicon.ico',
            badge: data.badge || '/favicon.ico',
            image: data.image,
            tag: data.tag || 'monetag-notification',
            renotify: true,
            requireInteraction: data.requireInteraction || false,
            actions: data.actions || [],
            data: {
                url: data.url || '/',
                zone: '9768324'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'New Notification',
                options
            )
        );
    } catch (e) {
        console.log('🔴 Push data error:', e);
        
        // Fallback notification
        event.waitUntil(
            self.registration.showNotification('New Notification', {
                body: 'You have a new notification',
                icon: '/favicon.ico',
                tag: 'monetag-fallback',
                data: { url: '/', zone: '9768324' }
            })
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    console.log('🟢 Notification clicked:', event);
    
    event.notification.close();
    
    const url = event.notification.data.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            // Check if there's already a window/tab open with the target URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // If no window/tab is already open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Background sync (if supported)
self.addEventListener('sync', function(event) {
    if (event.tag === 'monetag-sync') {
        event.waitUntil(
            // Sync logic here if needed
            Promise.resolve()
        );
    }
});

// Error handler
self.addEventListener('error', function(event) {
    console.log('🔴 SW Error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', function(event) {
    console.log('🔴 SW Unhandled Rejection:', event.reason);
});
