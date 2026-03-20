# ⚠️ URGENT FIX NEEDED — js/app.js Was Overwritten

## What Happened
On March 20, 2026, while updating email addresses and the Bookings API URL in the codebase, GitHub Copilot accidentally **replaced the entire contents of `js/app.js`** with a 7-line snippet instead of the full 773-line file. This broke the entire website's JavaScript functionality.

### Files That Were Successfully Updated (no issues):
- **`google-apps-script/Code.gs`** — `OWNER_EMAIL` was correctly changed to `Info@worksource.supplies` ✅

### File That Was Damaged:
- **`js/app.js`** — The entire file (773 lines) was overwritten with only 7 lines. **This broke the website.**

### File That Still Needs Updating:
- **`schedule.html`** — Line 139 still has the old email `support@worksource.supply`

---

## How to Fix `js/app.js`

### Step 1: Restore the original file
1. Go to: https://github.com/TAMProcess/tamprocess.github.io/blob/3b1f1243862f1076c10ee5078685b9c53deb1ee8/js/app.js
2. Click the **"Raw"** button (top-right of the code view)
3. Select all (`Ctrl+A` / `Cmd+A`) and copy (`Ctrl+C` / `Cmd+C`)
4. Now go to the broken file: https://github.com/TAMProcess/tamprocess.github.io/edit/master/js/app.js
5. Select all the current content and **paste over it** with what you copied
6. **DO NOT commit yet** — make the two edits below first

### Step 2: Make the two required changes in the pasted content

#### Change 1 — Line 481 (BOOKINGS_API)
Find:
```javascript
var BOOKINGS_API = ''; // Paste your Google Apps Script web app URL here
```
Replace with:
```javascript
var BOOKINGS_API = 'https://script.google.com/macros/s/AKfycbzPpt86WmwJb_37jzw4J1JZdgohrpvJ6cvw4fcBWj6E5oPeKplElFgaJwJNYCSHzwDz/exec';
```

#### Change 2 — Line 730 (FORM_EMAIL)
Find:
```javascript
var FORM_EMAIL = 'support@worksource.supply';
```
Replace with:
```javascript
var FORM_EMAIL = 'Info@worksource.supplies';
```

### Step 3: Commit
- Commit message: `Restore js/app.js and update email + bookings API`
- Commit directly to `master`

---

## How to Fix `schedule.html`

1. Go to: https://github.com/TAMProcess/tamprocess.github.io/edit/master/schedule.html
2. Find line 139 (search for `support@worksource.supply`)
3. You will see:
```html
<a href="mailto:support@worksource.supply" class="btn btn-outline" style="font-size:.85rem">support@worksource.supply</a>
```
4. Replace with:
```html
<a href="mailto:Info@worksource.supplies" class="btn btn-outline" style="font-size:.85rem">Info@worksource.supplies</a>
```
5. Commit directly to `master`

---

## Summary of All Email Changes Needed

| File | What to change | Old value | New value | Status |
|------|---------------|-----------|-----------|--------|
| `google-apps-script/Code.gs` | `OWNER_EMAIL` | `support@worksource.supply` | `Info@worksource.supplies` | ✅ Done |
| `js/app.js` | `FORM_EMAIL` (line 730) | `support@worksource.supply` | `Info@worksource.supplies` | ❌ Needs fix (file was overwritten) |
| `js/app.js` | `BOOKINGS_API` (line 481) | `''` (empty) | Google Apps Script URL | ❌ Needs fix (file was overwritten) |
| `schedule.html` | mailto link (line 139) | `support@worksource.supply` | `Info@worksource.supplies` | ❌ Needs fix |

---

## Important Reference
The last known good version of `js/app.js` is preserved at this commit:
**https://github.com/TAMProcess/tamprocess.github.io/blob/3b1f1243862f1076c10ee5078685b9c53deb1ee8/js/app.js**

---

## After Fixing — Delete This File
Once all fixes are applied, you can safely delete this `FIX-INSTRUCTIONS.md` file from the repo.