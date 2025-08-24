# Service Worker Deployment Guide

## Deploy sw.js as CloudFlare Worker

### Step 1: Create Worker
1. Go to CloudFlare Dashboard → Workers & Pages
2. Click "Create" → "Create Worker"
3. Name it `service-worker` or similar

### Step 2: Upload Code
```javascript
// Copy your sw.js content here
// Your obfuscated service worker code
export default {
  async fetch(request) {
    // Return your service worker with proper headers
    return new Response(YOUR_SW_CONTENT, {
      headers: {
        'Content-Type': 'application/javascript',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
```

### Step 3: Set Route
1. Go to your domain's Workers routes
2. Add route: `yourdomain.com/sw.js`
3. Assign your service-worker Worker

### Benefits:
- ✅ Update service worker independently
- ✅ No full site rebuild required
- ✅ Proper service worker headers
- ✅ Instant updates

## Alternative: Quick Deploy Script

Create a deployment script that only builds when sw.js changes:

```bash
#!/bin/bash
# quick-deploy.sh

# Check if sw.js changed
if git diff --name-only HEAD~1 HEAD | grep -q "public/sw.js"; then
  echo "Service worker changed, deploying..."
  npm run build
  # Your deployment command
else
  echo "No service worker changes, skipping deploy"
fi
```

## Manage CloudFlare Pages Versions

### Delete Old Deployments:
1. Dashboard → Workers & Pages → Your Project
2. Deployments tab
3. Click "..." → Delete deployment
4. Keep last 3-5 versions for rollback

### Auto-cleanup:
CloudFlare automatically removes very old deployments, but you can manually clean up preview branches.
