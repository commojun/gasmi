function doPost(e) {
  var event = JSON.parse(e.postData.contents).events[0];
  var userMessage = event.message.text;

  var message = "";
  if ( userMessage === "ID" ) {
    message = tellID(event);
  }
  else {
    // 疎通確認するときにコメントを外してください。
    // message = "メッセージを受け取ったわよ！";
  }

  replyMessage(event.replyToken, message);
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function replyMessage(token, message) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': token,
      'messages': [{
        'type': 'text',
        'text': message,
      }],
    }),
  });
}

function pushMessage(to, message) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': to,
      'messages': [{
        'type': 'text',
        'text': message,
      }],
    }),
  });
}

function tellID(event) {
  // ID
  var userID = event.source.userId;
  var talkID = "";
  if (event.source.type === "group") {
    talkID = event.source.groupId;
  } else if (event.source.type === "room") {
    talkID = event.source.roomId;
  }

  var message = "あなたのID: " + userID;
  if (talkID != "") {
    message += "\nこのチャットのID: " + talkID;
  }

  return message;
}

function notice() {
  var sheet = SpreadsheetApp.openById(SHEET_KEY).getSheetByName('alarm');
  var data  = sheet.getDataRange().getValues();

  var dayStr = ["日", "月", "火", "水", "木", "金", "土"];
  var now = new Date();
  for (var i=1; i<data.length; i++) {
    var [minute, hour, dayOfMonth, month, dayOfWeek, weekNum, message, to] = data[i];

    if (
      ( minute     ==  now.getMinutes()      || minute     === "*")
    && (hour       ==  now.getHours()        || hour       === "*")
    && (dayOfMonth ==  now.getDate()         || dayOfMonth === "*")
    && (month      ==  now.getMonth() + 1    || month      === "*")
    && (dayOfWeek  === dayStr[now.getDay()]  || dayOfWeek  === "*")
    && (weekNum == parseInt(now.getDate() / 7) + 1 || weekNum === "*")
    ) {
      pushMessage(to, message);
    }
  }
}