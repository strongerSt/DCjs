//Fri Mar 21 2025 09:19:01 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
let body = JSON.parse($response.body);
function modifyObject(_0x1018bc) {
  for (let _0x5130ef in _0x1018bc) {
    _0x1018bc.hasOwnProperty(_0x5130ef) && (typeof _0x1018bc[_0x5130ef] === "object" && _0x1018bc[_0x5130ef] !== null ? modifyObject(_0x1018bc[_0x5130ef]) : (_0x5130ef === "vip" && (_0x1018bc[_0x5130ef] = 1), _0x5130ef === "vip_expire" && (_0x1018bc[_0x5130ef] = "2099-09-09 18:18:18")));
  }
}
modifyObject(body);
$done({
  body: JSON.stringify(body)
});