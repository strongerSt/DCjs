//Sun Jan 26 2025 01:55:44 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
(() => {
  function b(e) {
    b = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (h) {
      return typeof h;
    } : function (h) {
      {
        return h && "function" == typeof Symbol && h.constructor === Symbol && h !== Symbol.prototype ? "symbol" : typeof h;
      }
    };
    return b(e);
  }
  var c = $response.body;
  var d = JSON.parse(c);
  !function e(f) {
    {
      if ("object" === b(f) && null !== f) {
        for (var h in f) "vip" === h ? f[h] = 1 : "vip_endtime" === h || "school_vip_endtime" === h ? f[h] = 9199999999 : e(f[h]);
      }
    }
  }(d);
  $done({
    body: JSON.stringify(d)
  });
})();