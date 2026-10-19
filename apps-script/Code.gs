/**
 * Backend del sorteo: guarda cada participación en la hoja "Participantes".
 * Instalación: ver README.md → "Conectar Google Sheets".
 */
var SHEET_NAME = "Participantes";
var HEADERS = ["fecha", "nombre", "email", "edad", "pdv_elegido", "pdv_qr", "ref"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET ?action=count → cantidad de anotados (para el contador de la landing)
function doGet(e) {
  var sheet = getSheet_();
  return json_({ ok: true, count: Math.max(sheet.getLastRow() - 1, 0) });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var email = String(d.email || "").trim().toLowerCase();
    var edad = parseInt(d.edad, 10);
    if (!email || !d.nombre || !(edad >= 18)) return json_({ ok: false, error: "datos_invalidos" });

    var sheet = getSheet_();
    var last = sheet.getLastRow();
    if (last > 1) {
      var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === email) return json_({ ok: true, duplicado: true });
      }
    }

    sheet.appendRow([
      new Date(),
      String(d.nombre).slice(0, 60),
      email.slice(0, 120),
      edad,
      String(d.pdv || "").slice(0, 30),
      String(d.pdv_qr || "").slice(0, 30),
      String(d.ref || "").slice(0, 30)
    ]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
