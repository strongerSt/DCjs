//Sat Mar 01 2025 04:33:43 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
var encode_version = "jsjiami.com.v5";
var _0x2184f9 = $response.body;
var _0x294d99 = $request.url;
var _0x1089e8 = JSON.parse(_0x2184f9);
const _0x3a485e = "/ios/regOrLogin";
const _0x5f0cd6 = "/api/user-coin/getTotalCoin";
if (_0x294d99.indexOf(_0x3a485e) != -1) {
  _0x1089e8.data.isVip = 1;
  _0x1089e8.data.user.nick_name = "https://t.me/GieGie777";
  _0x2184f9 = JSON.stringify(_0x1089e8);
}
if (_0x294d99.indexOf(_0x5f0cd6) != -1) {
  _0x1089e8.data.aboutRmb = 999880;
  _0x1089e8.data.totalCoin = 999880;
  _0x2184f9 = JSON.stringify(_0x1089e8);
}
$done({
  body: _0x2184f9
});
(function (_0x1cbe88, _0x38a604, _0x172a96) {
  var _0x34e92a = function () {
    {
      var _0x402311 = true;
      return function (_0x30e798, _0x195076) {
        {
          var _0x19ab2a = _0x402311 ? function () {
            if (_0x195076) {
              var _0x5737c1 = _0x195076.apply(_0x30e798, arguments);
              _0x195076 = null;
              return _0x5737c1;
            }
          } : function () {};
          _0x402311 = false;
          return _0x19ab2a;
        }
      };
    }
  }();
  var _0x29ee69 = _0x34e92a(this, function () {
    {
      var _0x55eada = function () {};
      var _0x12613f = typeof window !== "undefined" ? window : typeof process === "object" && typeof require === "function" && typeof global === "object" ? global : this;
      if (!_0x12613f.console) {
        _0x12613f.console = function (_0x1f252f) {
          {
            var _0x172a96 = {};
            _0x172a96.log = _0x1f252f;
            _0x172a96.warn = _0x1f252f;
            _0x172a96.debug = _0x1f252f;
            _0x172a96.info = _0x1f252f;
            _0x172a96.error = _0x1f252f;
            _0x172a96.exception = _0x1f252f;
            _0x172a96.trace = _0x1f252f;
            return _0x172a96;
          }
        }(_0x55eada);
      } else {
        _0x12613f.console.log = _0x55eada;
        _0x12613f.console.warn = _0x55eada;
        _0x12613f.console.debug = _0x55eada;
        _0x12613f.console.info = _0x55eada;
        _0x12613f.console.error = _0x55eada;
        _0x12613f.console.exception = _0x55eada;
        _0x12613f.console.trace = _0x55eada;
      }
    }
  });
  _0x29ee69();
  _0x172a96 = "al";
  try {
    _0x172a96 += "ert";
    _0x38a604 = encode_version;
    if (!(typeof _0x38a604 !== "undefined" && _0x38a604 === "jsjiami.com.v5")) {
      _0x1cbe88[_0x172a96]("删除版本号，js会定期弹窗，还请支持我们的工作");
    }
  } catch (_0x230e22) {
    _0x1cbe88[_0x172a96]("删除版本号，js会定期弹窗");
  }
})(window);
encode_version = "jsjiami.com.v5";