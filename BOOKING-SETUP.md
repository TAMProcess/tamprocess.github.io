# Booking System Setup — 5 Minutes

Your schedule page already emails you every booking via FormSubmit.
To also **block booked time slots** so no one else picks the same time, follow these steps.

---

## Step 1: Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **"WSS Bookings"**
3. In row 1, add these headers: `Date | Time | Name | Email | Booked At`

## Step 2: Add the Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code and paste this:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);
  var data = sheet.getDataRange().getValues();
  var bookings = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      bookings.push({ date: String(data[i][0]), time: String(data[i][1]) });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(bookings))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Sheet1');
    sheet.appendRow(['Date', 'Time', 'Name', 'Email', 'Booked At']);
  }
  var params = JSON.parse(e.postData.contents);
  sheet.appendRow([params.date, params.time, params.name || '', params.email || '', new Date().toISOString()]);
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** (Ctrl+S)

## Step 3: Deploy

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access** and allow the permissions
6. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

## Step 4: Paste the URL

Open `js/app.js` and find this line (around line 443):

```javascript
var BOOKINGS_API = ''; // Paste your Google Apps Script web app URL here
```

Paste your URL between the quotes:

```javascript
var BOOKINGS_API = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
```

Save, commit, and push. Done!

---

## How It Works

- When someone visits the schedule page, it loads all booked slots from your Google Sheet
- Booked time slots appear crossed out and can't be clicked
- When someone books a new slot, it saves to the sheet AND emails you via FormSubmit
- You can also manually add/remove rows in the Google Sheet to manage availability
