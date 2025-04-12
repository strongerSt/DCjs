//Sat Apr 12 2025 00:22:35 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
var Mike = JSON.parse($response.body);
Mike.payload.active = true;
$done({
  "body": JSON.stringify(Mike)
});