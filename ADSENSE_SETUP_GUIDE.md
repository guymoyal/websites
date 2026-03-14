# Google AdSense Setup Guide

## ✅ Current Status

Your AdSense account has been approved! However, **ads are not showing** because the ad slot IDs in your code are still placeholders. You need to create actual ad units in your AdSense dashboard and replace the placeholder IDs.

## 🔧 Why Ads Aren't Showing

**The Problem:** All ad slot IDs in `/lib/adConfig.ts` are placeholder values (like `1234567890`). Google AdSense requires real ad unit slot IDs that you create in your AdSense dashboard.

**The Solution:** Follow the steps below to create ad units and update your code.

## 📋 Step-by-Step Instructions

### Step 1: Create Ad Units in AdSense Dashboard

1. **Log into Google AdSense**
   - Go to https://adsense.google.com
   - Sign in with your approved account

2. **Navigate to Ads → By ad unit**
   - Click on "Ads" in the left sidebar
   - Select "By ad unit"

3. **Create Ad Units for Each Slot**

   You need to create ad units for each of these slots (they're already configured in your code):

   **Homepage:**
   - `homepage-banner` - Display ad (Leaderboard 728x90 or Responsive)

   **Tools Pages:**
   - `tools-bottom` - Display ad (Leaderboard 728x90 or Responsive)
   - `tool-top` - Display ad (Leaderboard 728x90 or Responsive)
   - `tool-sidebar` - Display ad (Rectangle 300x250 or Responsive)
   - `tool-bottom` - Display ad (Leaderboard 728x90 or Responsive)

   **Blog Pages:**
   - `blog-sidebar` - Display ad (Rectangle 300x250 or Responsive)
   - `blog-bottom` - Display ad (Leaderboard 728x90 or Responsive)
   - `article-top` - Display ad (Leaderboard 728x90 or Responsive)
   - `article-middle` - Display ad (Leaderboard 728x90 or Responsive)
   - `article-bottom` - Display ad (Leaderboard 728x90 or Responsive)

   **Category Pages:**
   - `categories-top` - Display ad (Leaderboard 728x90 or Responsive)
   - `categories-bottom` - Display ad (Leaderboard 728x90 or Responsive)
   - `category-top` - Display ad (Leaderboard 728x90 or Responsive)
   - `category-bottom` - Display ad (Leaderboard 728x90 or Responsive)

   **Other Pages:**
   - `submit-top` - Display ad (Leaderboard 728x90 or Responsive)
   - `submit-bottom` - Display ad (Leaderboard 728x90 or Responsive)

4. **For Each Ad Unit:**
   - Click "New ad unit"
   - Choose "Display ads"
   - Select "Responsive" format (recommended - works on all devices)
   - Give it a descriptive name (e.g., "Homepage Banner", "Tool Page Sidebar")
   - Click "Create"
   - **Copy the Ad unit ID** (it looks like: `1234567890`)

### Step 2: Update Ad Slot IDs in Code

1. **Open `/lib/adConfig.ts`**

2. **Replace placeholder IDs with real AdSense slot IDs**

   Example:
   ```typescript
   export const AD_SLOTS = {
     'homepage-banner': '1234567890',  // Replace with your real ID
     'tools-bottom': '1234567891',     // Replace with your real ID
     // ... etc
   }
   ```

3. **Save the file**

### Step 3: Verify AdSense Script

✅ **Already configured correctly!** Your AdSense script is properly placed in `/app/layout.tsx`:
- Script URL: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2201239508910470`
- Client ID: `ca-pub-2201239508910470` ✅

### Step 4: Verify ads.txt File

✅ **Already configured correctly!** Your `/public/ads.txt` file contains:
```
google.com, pub-2201239508910470, DIRECT, f08c47fec0942fa0
```

Make sure this file is accessible at: `https://aibuzztools.com/ads.txt`

### Step 5: Test Your Ads

1. **Deploy your changes** (if you updated slot IDs)
2. **Wait 10-15 minutes** for AdSense to recognize the changes
3. **Check your site** - ads should start appearing
4. **Use AdSense Preview Tool** (in AdSense dashboard) to test ad display

## 🎯 Quick Checklist

- [ ] Created ad units in AdSense dashboard
- [ ] Copied all ad unit slot IDs
- [ ] Updated `/lib/adConfig.ts` with real slot IDs
- [ ] Verified `/public/ads.txt` is accessible
- [ ] Deployed changes
- [ ] Tested ads on your site

## ⚠️ Important Notes

1. **Ad Serving Delay:** After creating ad units, it may take 10-15 minutes for ads to start showing
2. **Traffic Requirements:** Google may not show ads if your site has very low traffic initially
3. **Ad Blockers:** Test in incognito mode or disable ad blockers to see ads
4. **Approval Status:** Make sure your AdSense account status shows "Active" (not just approved)

## 🐛 Troubleshooting

**Ads still not showing?**

1. **Check AdSense Dashboard:**
   - Go to Ads → By ad unit
   - Check if ad units show "Active" status
   - Look for any warnings or errors

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Look for AdSense errors in Console tab
   - Common errors:
     - "adsbygoogle.push() error: No slot size for availableWidth=0" - Usually means ad container is too small
     - "Invalid slot ID" - Slot ID is incorrect

3. **Verify Slot IDs:**
   - Double-check that slot IDs in `adConfig.ts` match AdSense dashboard
   - Make sure there are no extra spaces or typos

4. **Check ads.txt:**
   - Visit `https://aibuzztools.com/ads.txt` in browser
   - Should show: `google.com, pub-2201239508910470, DIRECT, f08c47fec0942fa0`

5. **Wait Time:**
   - New ad units can take up to 24 hours to start serving ads
   - Low traffic sites may see fewer ads initially

## 📊 Ad Placement Summary

Your ads are now placed on:

- ✅ **Homepage:** Banner ads (top and bottom)
- ✅ **Tools Listing:** Top and bottom ads
- ✅ **Tool Detail Pages:** Top, sidebar, and bottom ads
- ✅ **Blog Listing:** Sidebar and bottom ads
- ✅ **Blog Articles:** Top, middle, and bottom ads
- ✅ **Category Pages:** Top and bottom ads
- ✅ **Submit Page:** Top and bottom ads

## 🚀 Next Steps

1. Create ad units in AdSense dashboard
2. Update slot IDs in `/lib/adConfig.ts`
3. Deploy and test
4. Monitor AdSense dashboard for performance

Once you update the slot IDs, ads should start appearing within 10-15 minutes!
