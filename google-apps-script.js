/**
 * ==============================================================================
 * KAATTIKE KUTTIKAL COUSINS TRIP 2026 - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * SETUP INSTRUCTIONS (1 MINUTE):
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script" in the top menu
 * 3. Delete any code in the editor and PASTE this entire file
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set Description: "Trip 2026 Registration"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <--- (IMPORTANT: Select 'Anyone')
 * 9. Click "Deploy", approve permissions, and COPY the Web App URL (starts with https://script.google.com/macros/s/...)
 * 10. Paste the URL into js/app.js where it says GOOGLE_SCRIPT_URL!
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet();
    var contents = e.postData ? e.postData.contents : "";
    var data = JSON.parse(contents);

    var membersSummary = (data.membersList || []).map(function(m, idx) {
      var typeStr = m.type === 'adult' ? 'Adult' : (m.type === 'kid8to15' ? '8-15 Yrs' : 'Below 8');
      return (idx + 1) + ". " + m.name + " (" + typeStr + ")";
    }).join("\n");

    var membersJson = JSON.stringify(data.membersList || []);

    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.ticketId || "",
      data.familyHead || "",
      data.phone || "",
      data.totalCount || 1,
      data.adultCount || 1,
      data.kid8to15Count || 0,
      data.kidBelow8Count || 0,
      membersSummary,
      membersJson
    ]);

    var allMembers = fetchAllMembers(sheet);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration recorded successfully",
      data: allMembers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var allMembers = fetchAllMembers(sheet);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: allMembers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registrations") || ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Ticket ID",
      "Family Head / Contact",
      "Phone",
      "Total Members",
      "Adults (15+)",
      "Kids (8-15)",
      "Kids (Below 8)",
      "Members Summary",
      "Raw Members Data"
    ];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#059669");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function fetchAllMembers(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var list = [];
  // Skip header row
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[1] && !row[2]) continue; // Skip blank rows

    var membersList = [];
    if (row[9]) {
      try {
        membersList = JSON.parse(row[9]);
      } catch (err) {
        membersList = [];
      }
    }

    list.push({
      timestamp: row[0],
      ticketId: String(row[1] || ""),
      familyHead: String(row[2] || ""),
      phone: String(row[3] || ""),
      totalCount: Number(row[4]) || 1,
      adultCount: Number(row[5]) || 1,
      kid8to15Count: Number(row[6]) || 0,
      kidBelow8Count: Number(row[7]) || 0,
      membersSummary: String(row[8] || ""),
      membersList: membersList
    });
  }

  return list.reverse(); // Newest submissions first
}
