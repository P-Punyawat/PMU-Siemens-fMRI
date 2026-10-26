// Google Apps Script — pre-registration intake into a Google Sheet,
// with confirmation emails on submit and a manual bulk-announce function.
//
// Setup:
// 1. Create (or open) the Google Sheet you want registrations to land in.
// 2. Extensions > Apps Script. Paste this file's contents in as Code.gs.
// 3. Deploy > New deployment > type "Web app".
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the deployment's /exec URL and put it in index.html's
//    <form action="..."> in place of YOUR_SCRIPT_ID.
// 5. Re-deploy (new version) any time you edit this script — the /exec URL
//    only picks up new code after a fresh deployment.
//
// When registration officially opens:
// - Fill in the registration link/instructions in sendAnnouncementToAll below.
// - In the Apps Script editor, select sendAnnouncementToAll from the function
//   dropdown and click Run. It emails everyone in the sheet exactly once —
//   re-running it (e.g. after adding late pre-registrations) will only email
//   rows that haven't been marked as notified yet.
//
// Note: MailApp has a daily send quota (100/day on a plain Gmail account,
// much higher on Google Workspace) — fine for typical symposium volumes,
// but worth knowing if the list grows large.

var HEADERS = ['Timestamp', 'Name', 'Email', 'Affiliation', 'Dietary', 'Sessions', 'Notified'];

function doPost(e) {
  var sheet = getRegistrationsSheet();
  var params = e.parameter;
  var sessions = e.parameters['session'] ? e.parameters['session'].join(', ') : '';

  sheet.appendRow([
    new Date(),
    params.name || '',
    params.email || '',
    params.affiliation || '',
    params.dietary || '',
    sessions,
    false
  ]);

  if (params.email) {
    sendConfirmationEmail(params.name, params.email);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRegistrationsSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function sendConfirmationEmail(name, email) {
  var subject = "You're on the list — Bangkok Brain Imaging Symposium (B-BIS)";
  var body =
    'Hi ' + (name || 'there') + ',\n\n' +
    'Thanks for pre-registering interest in the Bangkok Brain Imaging Symposium (B-BIS), ' +
    '29–30 January 2027 at the Rattana Wittayapat Building, Faculty of Medicine, Chulalongkorn University.\n\n' +
    "This confirms we've received your pre-registration of interest — it's not a confirmed ticket. " +
    "We'll email you again as soon as full registration opens.\n\n" +
    'Best,\nB-BIS Organizing Team';
  MailApp.sendEmail(email, subject, body);
}

// Run this manually from the editor (function dropdown > authorizeMailApp >
// Run) once, purely to trigger and approve the Gmail-send OAuth prompt.
// Unlike doPost, it takes no event argument, so it won't crash when run
// with no parameters. Safe to delete after you've approved the prompt once.
function authorizeMailApp() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'B-BIS script authorization test', 'If you got this, MailApp is authorized.');
}

// Run manually (function dropdown > sendAnnouncementToAll > Run) once
// registration officially opens. Safe to re-run — only emails rows where
// the Notified column isn't already checked.
function sendAnnouncementToAll() {
  var sheet = getRegistrationsSheet();
  var data = sheet.getDataRange().getValues();
  var subject = 'Registration is now open — Bangkok Brain Imaging Symposium (B-BIS)';

  for (var i = 1; i < data.length; i++) { // skip header row
    var name = data[i][1];
    var email = data[i][2];
    var notified = data[i][6];
    if (!email || notified === true) continue;

    var body =
      'Hi ' + (name || 'there') + ',\n\n' +
      'Registration for the Bangkok Brain Imaging Symposium (B-BIS) is now open.\n\n' +
      '[Add registration link/instructions here before running this function.]\n\n' +
      'Best,\nB-BIS Organizing Team';

    MailApp.sendEmail(email, subject, body);
    sheet.getRange(i + 1, 7).setValue(true); // mark Notified
  }
}
