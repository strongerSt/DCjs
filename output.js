//Tue Jan 28 2025 00:30:59 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
let _0x1ee426 = JSON.parse($response.body);
_0x1ee426.data.vod_play_list.forEach(_0xe5ad60 => {
  _0xe5ad60.urls.forEach(_0x4c1fbb => {
    _0x4c1fbb.is_free = true;
    _0x4c1fbb.try_see = 90000;
  });
});
$done({
  "body": JSON.stringify(_0x1ee426)
});