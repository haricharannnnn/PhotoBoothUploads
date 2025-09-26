// Google Apps Script: Save & List images to Drive
// 1) Replace FOLDER_ID with your Drive folder ID
// 2) Deploy as Web App (Execute as: Me, Who has access: Anyone)
var FOLDER_ID = "YOUR_FOLDER_ID_HERE";
var SECRET_KEY = ""; // optional: simple client-side key (not fully secure)

function doPost(e) {
  var folderId = FOLDER_ID;
  try {
    var folder = DriveApp.getFolderById(folderId);
    var imgBase64 = e.parameter.image;
    if (!imgBase64) throw "No image parameter received.";
    if (SECRET_KEY && e.parameter.key !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({status:"ERROR", message:"Invalid key"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    var eventName = e.parameter.event || "";
    var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
    var safeEvent = eventName.replace(/[^a-zA-Z0-9_-]/g, "");
    var filename = "photo" + (safeEvent ? "_" + safeEvent : "") + "_" + ts + ".png";
    var blob = Utilities.newBlob(Utilities.base64Decode(imgBase64), "image/png", filename);
    var file = folder.createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({status:"OK", fileUrl: file.getUrl()}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:"ERROR", message: err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var folderId = FOLDER_ID;
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var data = [];
  while (files.hasNext()) {
    var file = files.next();
    data.push({
      name: file.getName(),
      url: "https://drive.google.com/uc?export=download&id=" + file.getId()
    });
  }
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}
