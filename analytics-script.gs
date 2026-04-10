// ─────────────────────────────────────────────────────────────────────────────
// BENNY TALKS — Google Apps Script Analytics Endpoint
// ─────────────────────────────────────────────────────────────────────────────
//
// SETUP INSTRUCTIONS (takes about 3 minutes):
//
// 1. Go to sheets.google.com and create a new spreadsheet.
//    Name it "Benny Talks Analytics"
//
// 2. In that spreadsheet, click Extensions → Apps Script
//
// 3. Delete everything in the editor and paste ALL of this code in.
//
// 4. Click Save (the floppy disk icon), name the project "Benny Talks"
//
// 5. Click Deploy → New Deployment
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
//    Click Deploy. You may need to authorize the script — follow the prompts.
//
// 6. Copy the Web App URL that appears. It looks like:
//    https://script.google.com/macros/s/XXXXXXXXXX/exec
//
// 7. Paste that URL into the Benny Talks app under Settings → Analytics URL
//
// That's it. Every tap, routine, and timer event will log to this sheet.
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAMES = {
  taps:     'Taps',
  routines: 'Routines',
  timers:   'Timers',
  summary:  'Summary',
};

// ── Handle incoming POST requests from the app ──────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'tap')     logTap(ss, data);
    if (data.type === 'routine') logRoutine(ss, data);
    if (data.type === 'timer')   logTimer(ss, data);

    updateSummary(ss);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET requests for health check
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Benny Talks endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Log a card tap ───────────────────────────────────────────────────────────
function logTap(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.taps, [
    'Timestamp', 'Date', 'Time', 'Day of Week',
    'Word', 'Category', 'Emoji', 'Is Custom Card',
    'Session Hour', 'Tap Count Today'
  ]);

  const now   = new Date(data.time || Date.now());
  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // Count taps today for this word
  const todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const existing = sheet.getDataRange().getValues();
  let todayCount = 0;
  existing.forEach(row => {
    if (row[1] === todayStr && row[4] === data.label) todayCount++;
  });

  sheet.appendRow([
    now.toISOString(),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss'),
    days[now.getDay()],
    data.label    || '',
    data.cat      || '',
    data.emoji    || '',
    data.isCustom ? 'Yes' : 'No',
    now.getHours(),
    todayCount + 1,
  ]);
}

// ── Log a routine completion ─────────────────────────────────────────────────
function logRoutine(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.routines, [
    'Timestamp', 'Date', 'Time', 'Day of Week',
    'Routine Name', 'Steps Completed', 'Total Steps', 'Completed Fully',
    'Duration (seconds)'
  ]);

  const now = new Date(data.time || Date.now());
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  sheet.appendRow([
    now.toISOString(),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss'),
    days[now.getDay()],
    data.routineName  || '',
    data.stepsCompleted || 0,
    data.totalSteps   || 0,
    data.completed    ? 'Yes' : 'No',
    data.durationSecs || '',
  ]);
}

// ── Log a timer event ────────────────────────────────────────────────────────
function logTimer(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.timers, [
    'Timestamp', 'Date', 'Time', 'Day of Week',
    'Timer Duration (seconds)', 'Completed', 'Context'
  ]);

  const now = new Date(data.time || Date.now());
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  sheet.appendRow([
    now.toISOString(),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss'),
    days[now.getDay()],
    data.durationSecs || 0,
    data.completed    ? 'Yes' : 'No',
    data.context      || 'manual',
  ]);
}

// ── Update summary tab ───────────────────────────────────────────────────────
function updateSummary(ss) {
  let sheet = ss.getSheetByName(SHEET_NAMES.summary);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.summary);
    // Move summary to first position
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  }
  sheet.clearContents();

  const tapsSheet = ss.getSheetByName(SHEET_NAMES.taps);
  if (!tapsSheet) return;

  const data = tapsSheet.getDataRange().getValues();
  if (data.length <= 1) return; // header only

  const rows = data.slice(1); // skip header

  // Total taps
  const totalTaps = rows.length;

  // Today's taps
  const tz = Session.getScriptTimeZone();
  const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const todayTaps = rows.filter(r => r[1] === todayStr).length;

  // Top 10 words overall
  const wordFreq = {};
  rows.forEach(r => { const w = r[4]; wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const topWords = Object.entries(wordFreq).sort((a,b) => b[1]-a[1]).slice(0,10);

  // Top categories
  const catFreq = {};
  rows.forEach(r => { const c = r[5]; catFreq[c] = (catFreq[c] || 0) + 1; });
  const topCats = Object.entries(catFreq).sort((a,b) => b[1]-a[1]);

  // Taps by day of week
  const dayFreq = {};
  rows.forEach(r => { const d = r[3]; dayFreq[d] = (dayFreq[d] || 0) + 1; });

  // Taps by hour
  const hourFreq = {};
  rows.forEach(r => { const h = r[8]; hourFreq[h] = (hourFreq[h] || 0) + 1; });

  // Write summary
  const summaryData = [
    ['BENNY TALKS — ANALYTICS SUMMARY', '', ''],
    [`Last updated: ${new Date().toLocaleString()}`, '', ''],
    ['', '', ''],
    ['OVERVIEW', '', ''],
    ['Total Taps', totalTaps, ''],
    ["Today's Taps", todayTaps, ''],
    ['', '', ''],
    ['TOP 10 WORDS', 'Count', '% of Total'],
    ...topWords.map(([w, c]) => [w, c, `${Math.round(c/totalTaps*100)}%`]),
    ['', '', ''],
    ['CATEGORY BREAKDOWN', 'Count', '% of Total'],
    ...topCats.map(([c, n]) => [c, n, `${Math.round(n/totalTaps*100)}%`]),
    ['', '', ''],
    ['TAPS BY DAY OF WEEK', 'Count', ''],
    ...Object.entries(dayFreq).map(([d, n]) => [d, n, '']),
    ['', '', ''],
    ['TAPS BY HOUR OF DAY', 'Count', ''],
    ...Object.entries(hourFreq).sort((a,b)=>Number(a[0])-Number(b[0])).map(([h, n]) => [`${h}:00`, n, '']),
  ];

  sheet.getRange(1, 1, summaryData.length, 3).setValues(summaryData);

  // Basic formatting
  sheet.getRange(1,1).setFontSize(14).setFontWeight('bold');
  sheet.getRange(4,1).setFontWeight('bold');
  sheet.getRange(8,1,1,3).setFontWeight('bold').setBackground('#E8F7F5');
  sheet.getRange(10+topWords.length+1,1,1,3).setFontWeight('bold').setBackground('#FEF3E8');
  sheet.autoResizeColumns(1, 3);
}

// ── Helper: get or create a sheet with headers ───────────────────────────────
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#2A9D8F')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
