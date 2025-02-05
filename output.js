//Wed Feb 05 2025 13:19:58 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x2f470f = typeof $request !== "undefined",
  _0x35474a = typeof $loon !== "undefined",
  _0x1b0c91 = typeof $notify !== "undefined" && typeof $done !== "undefined",
  _0x2359de = (_0x34a553, _0x17ea9c, _0x59822c) => {
    if (_0x35474a) $notification.post(_0x34a553, _0x17ea9c, _0x59822c);
    if (_0x1b0c91) $notify(_0x34a553, _0x17ea9c, _0x59822c);
  },
  _0x4b6ab4 = (_0x28403f, _0xd2d22d) => {
    if (_0x35474a) return $persistentStore.write(_0x28403f, _0xd2d22d);
    if (_0x1b0c91) return $prefs.setValueForKey(_0x28403f, _0xd2d22d);
    return false;
  },
  _0x4fc5af = _0x55e147 => {
    if (_0x35474a) return $persistentStore.read(_0x55e147);
    if (_0x1b0c91) return $prefs.valueForKey(_0x55e147);
    return null;
  },
  _0x90d467 = _0x4b4bcb => {
    if (_0x35474a) return $persistentStore.remove(_0x4b4bcb);
    if (_0x1b0c91) return $prefs.removeValueForKey(_0x4b4bcb);
    return false;
  },
  _0x53543e = (_0x1c644a, _0xc29bae) => _0x1c644a + "_" + _0xc29bae,
  _0x4a82e9 = "Emby_request",
  _0x196e69 = _0x28b1f5 => {
    const _0x1cc883 = {};
    for (const _0x2e0748 in _0x28b1f5) {
      _0x1cc883[_0x2e0748.toLowerCase()] = _0x28b1f5[_0x2e0748];
    }
    return _0x1cc883;
  },
  _0x1c001a = () => {
    const _0x59a2e6 = new Set();
    let _0x3b3168 = 1,
      _0x14c5c5 = 1;
    while (true) {
      {
        const _0xc21a0f = _0x53543e(_0x4a82e9, _0x3b3168 + "_url"),
          _0x56a892 = _0x53543e(_0x4a82e9, _0x3b3168 + "_headers"),
          _0x42455d = _0x53543e(_0x4a82e9, _0x3b3168 + "_body"),
          _0xad33cb = _0x4fc5af(_0xc21a0f),
          _0x83da98 = _0x4fc5af(_0x56a892),
          _0xdb8a53 = _0x4fc5af(_0x42455d);
        if (!_0xad33cb || !_0x83da98) break;
        const _0x55e313 = JSON.parse(_0x83da98),
          _0x19e4be = _0x55e313.host;
        if (_0x19e4be === undefined || _0x59a2e6.has(_0x19e4be)) _0x90d467(_0xc21a0f), _0x90d467(_0x56a892), _0x90d467(_0x42455d);else {
          {
            if (_0x3b3168 !== _0x14c5c5) {
              _0x4b6ab4(_0xad33cb, _0x53543e(_0x4a82e9, _0x14c5c5 + "_url"));
              _0x4b6ab4(_0x83da98, _0x53543e(_0x4a82e9, _0x14c5c5 + "_headers"));
              if (_0xdb8a53) {
                _0x4b6ab4(_0xdb8a53, _0x53543e(_0x4a82e9, _0x14c5c5 + "_body"));
              } else {
                _0x90d467(_0x53543e(_0x4a82e9, _0x14c5c5 + "_body"));
              }
              _0x90d467(_0xc21a0f);
              _0x90d467(_0x56a892);
              _0x90d467(_0x42455d);
            }
            _0x59a2e6.add(_0x19e4be);
            _0x14c5c5++;
          }
        }
        _0x3b3168++;
      }
    }
  };
if (_0x2f470f) {
  const _0x50fa86 = $request.url,
    _0x819893 = _0x196e69($request.headers),
    _0x25ae98 = $request.body,
    _0x4e3f17 = _0x819893.host;
  if (!_0x4e3f17) {
    _0x2359de("Emby捕获", "失败❌", "请求头中缺少Host");
    $done({});
  }
  let _0xab0eae = 1,
    _0x531f28,
    _0x21d397,
    _0x3a0079;
  while (_0x4fc5af(_0x53543e(_0x4a82e9, _0xab0eae + "_url"))) {
    const _0x144a3e = _0x4fc5af(_0x53543e(_0x4a82e9, _0xab0eae + "_headers"));
    if (_0x144a3e && JSON.parse(_0x144a3e).host === _0x4e3f17) {
      _0x2359de("Emby" + _0xab0eae + "捕获", "已存在✅", "Host: " + _0x4e3f17 + "\n该Emby请求已成功获取请勿重复获取");
      $done({});
    }
    _0xab0eae++;
  }
  _0x531f28 = _0x53543e(_0x4a82e9, _0xab0eae + "_url");
  _0x21d397 = _0x53543e(_0x4a82e9, _0xab0eae + "_headers");
  _0x3a0079 = _0x53543e(_0x4a82e9, _0xab0eae + "_body");
  _0x4b6ab4(_0x50fa86, _0x531f28);
  _0x4b6ab4(JSON.stringify(_0x819893), _0x21d397);
  _0x25ae98 && _0x4b6ab4(_0x25ae98, _0x3a0079);
  _0x2359de("Emby" + _0xab0eae + "捕获", "成功✅", "Host: " + _0x4e3f17 + "\n多账号获取完即时手动关闭重写避免不必要的MiTM");
  $done({});
} else {
  async function _0x4d32f4(_0x4d0a49) {
    try {
      const _0x46eda6 = _0x53543e(_0x4a82e9, _0x4d0a49 + "_url"),
        _0x1caf9a = _0x53543e(_0x4a82e9, _0x4d0a49 + "_headers"),
        _0x2569fe = _0x53543e(_0x4a82e9, _0x4d0a49 + "_body"),
        _0x11aaea = _0x4fc5af(_0x46eda6),
        _0xb68cc5 = _0x4fc5af(_0x1caf9a),
        _0x1023db = _0x4fc5af(_0x2569fe);
      if (!_0x11aaea || !_0xb68cc5) throw new Error("未找到保存的URL或请求头");
      const _0x591931 = JSON.parse(_0xb68cc5),
        _0x482446 = _0x591931.host;
      if (!_0x482446) throw new Error("请求头中缺少Host");
      const _0x432817 = await new Promise((_0x252a7a, _0x5a6050) => {
        if (_0x35474a) $httpClient.post({
          "url": _0x11aaea,
          "headers": _0x591931,
          "body": _0x1023db
        }, (_0x178edf, _0x1a255a, _0x4c68dc) => {
          _0x178edf ? _0x5a6050(_0x178edf) : _0x252a7a(_0x1a255a);
        });else _0x1b0c91 && $task.fetch({
          "url": _0x11aaea,
          "method": "POST",
          "headers": _0x591931,
          "body": _0x1023db
        }).then(_0x29e3ef => {
          _0x252a7a(_0x29e3ef);
        }, _0x1e6b1e => {
          _0x5a6050(_0x1e6b1e);
        });
      });
      if (_0x432817.status === 204 || _0x432817.statusCode === 204) _0x2359de("Emby" + _0x4d0a49, "播放成功🎉", "Host: " + _0x482446 + "\n状态码204");else {
        _0x2359de("Emby" + _0x4d0a49, "失败", "Host: " + _0x482446 + "\n状态码: " + (_0x432817.status || _0x432817.statusCode));
      }
    } catch (_0x1dabcc) {
      _0x2359de("Emby" + _0x4d0a49, "错误", "错误信息: " + (_0x1dabcc.message || _0x1dabcc));
    }
  }
  async function _0x31b527() {
    _0x1c001a();
    let _0x27720c = 1;
    while (_0x4fc5af(_0x53543e(_0x4a82e9, _0x27720c + "_url"))) {
      await _0x4d32f4(_0x27720c);
      _0x27720c++;
    }
    _0x27720c === 1 && _0x2359de("Emby", "错误", "未找到任何已保存的请求");
    $done();
  }
  _0x31b527();
}