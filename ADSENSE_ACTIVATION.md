# 🎯 Google AdSense Activation Guide — iLoveConvert

## Step 1: Get AdSense Approved
1. Go to https://adsense.google.com
2. Sign up and submit your site: `https://iloveconvert.vercel.app`
3. Wait for approval (usually 1–7 days)

## Step 2: Get Your Publisher ID
- Find your Publisher ID in AdSense → Account → Account Information
- Format: `ca-pub-XXXXXXXXXXXXXXXXXX` (16 digits)

## Step 3: Create Ad Units
In AdSense dashboard, create these ad units:
- **Ad Unit 1** (Top Banner): Format = "Display", Size = Responsive
- **Ad Unit 2** (In-Content): Format = "In-article"  
- **Ad Unit 3** (Below Result): Format = "Display", Size = Responsive

Note down the **Ad Slot ID** (10 digits) for each unit.

## Step 4: Activate in Files

### 4a. Update Publisher ID (ALL pages)
Find and replace in ALL .html files:
```
FIND:    ca-pub-XXXXXXXXXXXXXXXXXXXX
REPLACE: ca-pub-YOUR_ACTUAL_ID_HERE
```

### 4b. Update Ad Slot IDs
For each ad unit in each .html file, replace `XXXXXXXXXX` with your slot ID.

### 4c. Uncomment the Ad Tags
In every .html file, find blocks like this and uncomment:
```html
<!-- BEFORE (commented out) -->
<!--
<ins class="adsbygoogle" ...></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
-->

<!-- AFTER (uncommented) -->
<ins class="adsbygoogle" ...></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### 4d. Activate the AdSense Script
Find in each .html file:
```html
<!--ADSENSE_ACTIVE-->
<script async src="https://pagead2.googlesyndication.com/..."></script>
<!--/ADSENSE_ACTIVE-->
```
Remove the `<!--ADSENSE_ACTIVE-->` and `<!--/ADSENSE_ACTIVE-->` wrapper lines.

## 💡 Quick Activation Script
Once you have your Publisher ID and Slot IDs, run this in a terminal:

```bash
# Replace with your real values
PUB_ID="ca-pub-YOUR_ID_HERE"
SLOT_ID="YOUR_SLOT_ID"

# Update all HTML files
find . -name "*.html" -exec sed -i "s/ca-pub-XXXXXXXXXXXXXXXXXXXX/$PUB_ID/g" {} \;
find . -name "*.html" -exec sed -i "s/data-ad-slot=\"XXXXXXXXXX\"/data-ad-slot=\"$SLOT_ID\"/g" {} \;
```

## Ad Placement Summary
Every page has **2 ad slots**:
1. 📍 **Top** — Below the tool hero / above the upload area
2. 📍 **Bottom** — Before FAQ section / before related tools

Hub pages (pdf-tools, image-tools, etc.) have **1 banner** at the top.
