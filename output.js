//Wed Feb 19 2025 08:52:59 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const KuWoLe = new Env("酷我音乐");
const {
  encrypt,
  decrypt,
  getVer,
  getInfo
} = KuWoLF("影子");
const KuWoLf = "5.2.13-2";
const KuWoLg = KuWoLe.toObj(KuWoLe.getval("KuWo")) || {};
let KuWoLh = "undefined" !== typeof $request ? $request.url : "";
let KuWoLi = "undefined" !== typeof $response ? $response.body : null;
let KuWoLj = KuWoLe.toObj(KuWoLi);
const KuWoLl = {
  playInfo: /mobi\.s\?f\=kwxs/,
  userInfo: /vip\/enc/,
  vipTabInfo: /vip\/v\d\/user\/vip/,
  bookVip: /(a\.p|v\d\/api\/(pay\/)?user\/info)/,
  musicInfo: /music\.pay\?newver\=\d$/,
  vipTheme: /(commercia\/)?vip\/(v\d\/theme\?op\=gd|player\/getStyleListByModel)/,
  kwBookHome: /v\d\/api\/advert\/myPage/,
  bottomTab: /kuwo\/ui\/info$/,
  indexTopAd: /openapi\/v\d\/operate\/homePage/,
  myPageVipBox: /kuwopay\/personal\/cells/,
  bookPageAdBar: /api\/v\d\/pay\/app\/getConfigInfo/,
  bookPageAd: /openapi\/v\d\/tingshu\/index\/radio/,
  vipTabAd: /kuwopay\/vip-tab\/(setting|page\/cells)/,
  vipTabUserBox: /pay\/viptab\/index\.html/,
  bookListAd: /((openapi)?v\d\/(api\/pay\/payInfo\/kwplayer\/payMiniBar|app\/startup\/config)|basedata\.s\?type\=get_album_info)/,
  userInfoLabel: /mgxh\.s\?user/,
  authPay: /authPay/
};
const KuWoLn = {
  playInfo: KuWoLo,
  userInfo: KuWoLp,
  vipTabInfo: KuWoLq,
  bookVip: KuWoLr,
  musicInfo: KuWoLs,
  vipTheme: KuWoLt,
  kwBookHome: KuWoLu,
  bottomTab: KuWoLv,
  myPageVipBox: KuWoLw,
  indexTopAd: KuWoLx,
  bookPageAdBar: KuWoLy,
  bookPageAd: KuWoLz,
  vipTabAd: KuWoLA,
  vipTabUserBox: KuWoLB,
  bookListAd: KuWoLC,
  userInfoLabel: KuWoLD,
  authPay: KuWoLE
};
for (const [KuWoLH, KuWoLI] of Object.entries(KuWoLl)) {
  if (KuWoLI.test(KuWoLh)) {
    (async () => {
      await KuWoLn[KuWoLH]();
    })().catch(b => {
      KuWoLe.log("‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️", b.message);
    });
    break;
  }
}
async function KuWoLo() {
  const {
    user,
    isVip,
    endTime,
    keys,
    PlayID,
    Song,
    ver
  } = KuWoLg;
  !(async () => {
    await getInfo(user, "kuwo");
    await getVer();
    if (isVip && new Date().getTime() < endTime && KuWoLf == ver && KuWoLj.data != 200) {
      const p = keys[Math.floor(Math.random() * keys.length)];
      const q = decrypt(p);
      const r = {
        br: 4000,
        url: "4000kflac"
      };
      const s = {
        br: 2000,
        url: "2000kflac"
      };
      const t = {
        br: 320,
        url: "320kmp3"
      };
      const u = {
        br: 128,
        url: "128kmp3"
      };
      const v = {
        br: 100,
        url: "100kogg"
      };
      const w = {
        br: 96,
        url: "96kwma"
      };
      const x = {
        br: 48,
        url: "48kaac"
      };
      const y = [r, s, t, u, v, w, x];
      let z = 0;
      if ("book" == Song) {
        z = 2;
      }
      while (y[z]) {
        {
          const A = {
            url: "http://mobi.kuwo.cn/mobi.s?f=web&source=" + q + "&type=convert_url_with_sign&br=" + y[z].url + "&rid=" + PlayID
          };
          await KuWoLe.http.get(A).then(B => {
            KuWoLi = B.body;
            KuWoLj = KuWoLe.toObj(KuWoLi);
          });
          if (KuWoLj.data.bitrate == y[z].br) {
            break;
          }
          z++;
        }
      }
    }
    const o = {
      body: KuWoLi
    };
    KuWoLe.done(o);
  })();
}
async function KuWoLp() {
  const d = new URL(KuWoLh).searchParams;
  let e = d.get("uid");
  if ("number" !== typeof e) {
    e = KuWoLh.replace(/.*?uid=(\d+).*/, "$1");
  }
  !(async () => {
    await getInfo(e, "kuwo");
    KuWoLi = await KuWoLe.http.get(KuWoLh.replace(/uid=\d+/g, "uid=238581279")).then(g => g.body);
    const f = {
      body: KuWoLi
    };
    KuWoLe.done(f);
  })();
}
async function KuWoLq() {
  const g = {
    vipIcon: "https://image.kuwo.cn/fe/13e4f930-f8bc-4b86-8def-43cbc3c7d86c7.png",
    vipmIcon: "https://image.kuwo.cn/fe/34ad47f8-da7f-43e4-abdc-e6c995666368yyb.png",
    svipIcon: "https://image.kuwo.cn/fe/13e4f930-f8bc-4b86-8def-43cbc3c7d86c7.png",
    luxuryIcon: "https://h5s.kuwo.cn/upload/pictures/20250107/b81d9c5c7af42dc5ed6281fcbe19fcc7.png",
    growthValue: "9999",
    vipTag: "VIP7",
    openBtnText: KuWoLg.endTime && "超级会员" || "未授权",
    vipExpire: "" + KuWoLg.endTime,
    vipExpires: KuWoLg.endTime,
    vipmExpire: "" + KuWoLg.endTime,
    vip3Expire: "" + KuWoLg.endTime,
    vipLuxuryExpire: "" + KuWoLg.endTime,
    svipExpire: "" + KuWoLg.endTime,
    isYearUser: "2",
    biedSong: "1",
    vipmAutoPayUser: "1",
    svipAutoPayUser: "1"
  };
  Object.assign(KuWoLj.data, g);
  delete KuWoLj.data.iconJumpUrl;
  delete KuWoLj.data.adActUrl;
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const h = {
    body: KuWoLi
  };
  KuWoLe.done(h);
}
async function KuWoLr() {
  if ("songs" in KuWoLj) {
    {
      for (let g in KuWoLj.songs) {
        {
          const i = KuWoLj.songs[g];
          const {
            id = KuWoLi.replace(/.*?\"id\":(\d+).*/, "$1")
          } = i;
          if ("number" == typeof id) {
            KuWoLg.PlayID = id;
            KuWoLg.Song = "book";
            KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
            break;
          }
        }
      }
    }
  }
  KuWoLi = KuWoLi.replace(/(policy|policytype)\":\d/g, "$1\":0").replace(/(playright|downright|type|bought|bought_vip|limitfree|vipType)\":\d/g, "$1\":1").replace(/(end|endtime|vipExpires|bought_vip_end)\":\d+/g, "$1\":4077187200");
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLs() {
  const e = g => {
    const i = {
      lnUBF: "title",
      rvywp: "homeTop"
    };
    for (let j in g) {
      {
        if (typeof g[j] === "string" && g[j].includes("1")) {
          {
            g[j] = g[j].replace(/1/g, "0");
          }
        } else {
          if (typeof g[j] === "object" && g[j] !== null) {
            {
              e(g[j]);
            }
          }
        }
      }
    }
  };
  if ("songs" in KuWoLj && Array.isArray(KuWoLj.songs)) {
    const {
      id = KuWoLi.replace(/.*?\"id\":(\d+).*/, "$1")
    } = KuWoLj.songs[0];
    KuWoLg.PlayID = parseInt(id);
    KuWoLg.Song = "music";
    KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
    e(KuWoLj.songs[0].payInfo);
    if ("audio" in KuWoLj.songs[0] && Array.isArray(KuWoLj.songs[0].audio)) {
      {
        KuWoLj.songs[0].audio.forEach(h => h.st = 0);
        let g = KuWoLj.songs[0].audio[0].policy;
        KuWoLj.user[0] = {
          pid: KuWoLj.songs[0].audio[0].pid,
          type: g,
          name: g + "_1",
          categray: g + "_1",
          id: KuWoLj.songs[0].id,
          order: 375787919,
          final: [],
          buy: 1657425321,
          begin: 1657425321,
          end: 4077187200,
          CurEnd: 0,
          playCnt: 0,
          playUpper: 300,
          downCnt: 0,
          downUpper: 300,
          playVideoCnt: 0,
          playVideoUpper: 3000,
          downVideoCnt: 0,
          downVideoUpper: 3000,
          price: KuWoLj.songs[0].audio[0].price,
          period: 1000,
          feetype: 0,
          info: KuWoLj.songs[0]
        };
      }
    }
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const f = {
    body: KuWoLi
  };
  KuWoLe.done(f);
}
async function KuWoLt() {
  if ("vipTheme" in KuWoLj.data) {
    {
      KuWoLj.data.vipTheme.type = "free";
      delete KuWoLj.data.needBieds;
      KuWoLi = KuWoLe.toStr(KuWoLj);
    }
  } else {
    KuWoLi = KuWoLi.replace(/\"(paymentType)\":\d/g, "\"$1\":0").replace(/(umpUrl)\":\".*?\"/g, "$1\":\"\"");
  }
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLu() {
  const g = {
    scheme: null,
    title: "酷我畅听",
    url: null,
    subTitle: "畅听服务由影子提供"
  };
  Object.assign(KuWoLj.data, g);
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const h = {
    body: KuWoLi
  };
  KuWoLe.done(h);
}
async function KuWoLv() {
  const d = {
    bottomLiveTab: "0",
    netEarn: "0"
  };
  Object.assign(KuWoLj.data.mapTestInfo.bottomTabTest.mapParams, d);
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLw() {
  delete KuWoLj.data.list[0].route;
  delete KuWoLj.data.list[0].description;
  KuWoLj.data.list[0].title = "我的会员";
  KuWoLj.data.list[1].title = "账户未授权";
  KuWoLj.data.list[1].description = "点击获取授权";
  KuWoLj.data.list[1].route.params.url = "https://pay.kuwo.cn/authPay";
  if (KuWoLg.endTime) {
    delete KuWoLj.data.list[1].route;
    KuWoLj.data.list[1].title = "授权至：";
    KuWoLj.data.list[1].description = KuWoLe.time("yyyy-MM-dd", KuWoLg.endTime);
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
async function KuWoLx() {
  let e = ["发现", "推荐", "听书", "看短剧"];
  let f = 0;
  while (KuWoLj.data.homeTop[f]) {
    if (!e.includes(KuWoLj.data.homeTop[f].title)) {
      delete KuWoLj.data.homeTop[f];
    }
    f++;
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
async function KuWoLy() {
  const e = h => {
    const i = {};
    i.ZWOOi = "\"$1\":0";
    i.uMzFn = "$1\":\"\"";
    i.VLmgn = "child";
    const j = i;
    {
      for (let k in h) {
        {
          if (typeof h[k] === "string") {
            if (k.includes("btnText")) {
              h[k] = KuWoLg.endTime && "超级会员" || "未授权";
            }
            if (k.includes("icon")) {
              {
                h[k] = "https://h5s.kuwo.cn/upload/pictures/20250107/b81d9c5c7af42dc5ed6281fcbe19fcc7.png";
              }
            }
            if (k.includes("Url")) {
              {
                h[k] = null;
              }
            }
          } else {
            if (typeof h[k] === "object" && h[k] !== null) {
              {
                e(h[k]);
              }
            }
          }
        }
      }
    }
  };
  const f = (h, i = []) => {
    if (typeof i === "string") {
      {
        i = [i];
      }
    }
    for (let m in h) {
      {
        if (!i.includes(m)) {
          delete h[m];
        }
      }
    }
  };
  if ("data" in KuWoLj) {
    const h = ["subConfigType", "tsAdBarInfoV2"];
    f(KuWoLj.data, h);
    f(KuWoLj.data.tsAdBarInfoV2, "tsHomeWeex");
    e(KuWoLj.data);
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
async function KuWoLz() {
  let e = ["小焦点", "免费模式", "看广告"];
  let f = 0;
  while (KuWoLj.data.child[f]) {
    if (e.some(h => KuWoLj.data.child[f].label.includes(h))) {
      delete KuWoLj.data.child[f].child;
    }
    f++;
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
async function KuWoLA() {
  if ("tab" in KuWoLj.data) {
    let f = 1;
    while (KuWoLj.data.tab.vipTypes[0].topics[f]) {
      delete KuWoLj.data.tab.vipTypes[0].topics[f];
      f++;
    }
  } else {
    if (Array.isArray(KuWoLj.data)) {
      {
        let h = ["会员福利"];
        let j = 0;
        while (KuWoLj.data[j]) {
          if (h.some(k => KuWoLj.data[j].title.includes(k))) {
            delete KuWoLj.data[j].data;
          }
          j++;
        }
      }
    }
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLB() {
  if (KuWoLi) {
    {
      KuWoLi = KuWoLi.replace("</body>", "<script>function startChecking(){let interval=setInterval(()=>{const elements=document.getElementsByClassName('container');if(elements&&elements.length>0){const d=elements[0];if(window.getComputedStyle(d).display!=='none'){d.style.display='none';}}},100);return interval;}let intervalId;document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){clearInterval(intervalId);}else if(document.visibilityState==='visible'){intervalId=startChecking();}});document.addEventListener('DOMContentLoaded',()=>{intervalId=startChecking();});</script></body>");
    }
  }
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLC() {
  const e = ["data", "dataV2", "child_level_info"];
  e.forEach(g => {
    if (g in KuWoLj) {
      delete KuWoLj[g];
    }
  });
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const f = {
    body: KuWoLi
  };
  KuWoLe.done(f);
}
async function KuWoLD() {
  if (KuWoLi) {
    KuWoLi = KuWoLi.replace(/<section.*?\/userinfolabel><\/section>/, "");
  }
  const b = {
    body: KuWoLi
  };
  KuWoLe.done(b);
}
async function KuWoLE() {
  KuWoLi = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui\"><title>authPay...</title><style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}iframe{width:100%;height:100%;border:none;overflow:hidden;}</style></head><body><iframe src=\"https://napi.ltd/authPay?action=kuwo&user=" + KuWoLg.user + "\"></iframe></body></html>";
  const b = {
    body: KuWoLi
  };
  KuWoLe.done(b);
}
function KuWoLF(e) {
  e = e || "YingZi";
  const k = p => {
    {
      let q = new TextEncoder().encode(p);
      let r = new TextEncoder().encode(e);
      let s = new Uint8Array(q.length);
      for (let t = 0; t < q.length; t++) {
        let u = q[t] ^ r[t % r.length];
        while (u >= 256) {
          u %= 256;
        }
        s[t] = u;
      }
      return btoa(String.fromCharCode(...s));
    }
  };
  const l = p => {
    let q = new TextEncoder().encode(e);
    let r = new Uint8Array(atob(p).split("").map(t => t.charCodeAt(0)));
    let s = new Uint8Array(r.length);
    for (let t = 0; t < r.length; t++) {
      let u = r[t] ^ q[t % q.length];
      while (u >= 256) {
        {
          u %= 256;
        }
      }
      s[t] = u;
    }
    return new TextDecoder().decode(s);
  };
  const m = async () => {
    {
      let r = "https://napi.ltd/getVer";
      let s = await KuWoLe.http.get(r).then(u => u.body);
      let t = KuWoLe.toObj(s);
      if (KuWoLf != t.kuwo) {
        KuWoLe.msg("需要更新 -> 请更新你的脚本！");
      }
      KuWoLg.ver = t.kuwo;
      KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
    }
  };
  const n = async (p, q) => {
    let r = "type=" + q + "&user=" + p;
    if (!KuWoLg.user || p != KuWoLg.user || !KuWoLg.endTime || new Date().getTime() > KuWoLg.endTime || !KuWoLg.keys || KuWoLg.ver !== KuWoLf) {
      KuWoLe.log("正在获取 " + p + " 的授权信息…");
      const s = {
        url: "https://yingzi-0gwxqpln4f7a7fda-1251393964.ap-shanghai.app.tcloudbase.com/getInfo",
        body: r
      };
      let t = KuWoLe.toObj(await KuWoLe.http.post(s).then(u => u.body));
      for (let u in t) {
        {
          if (t.hasOwnProperty(u)) {
            {
              KuWoLg[u] = t[u];
            }
          }
        }
      }
      KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
      KuWoLe.log("数据获取完成...");
      if (t.isVip) {
        {
          let x = KuWoLe.time("yyyy-MM-dd HH:mm", KuWoLg.endTime);
          if (KuWoLf != KuWoLg.ver) {
            x += "\n需要更新 -> 请更新你的脚本！";
          }
          KuWoLe.log("当前账户 " + p + " 已授权\n授权有效期至：" + x);
          KuWoLe.msg("当前账户 " + p + " 已授权", "", "授权有效期至：" + x);
        }
      } else {
        KuWoLe.log("未能获取到当前账户 " + p + " 的授权信息\n即将再次获取你的授权信息");
        KuWoLe.msg("未获取到授权信息", "", "请重启应用或点击本条通知获取授权码", {
          "open-url": "https://pay.kuwo.cn/authPay",
          "media-url": "https://file.napi.ltd/Static/Image/KuWo.png"
        });
      }
    } else {
      {
        KuWoLe.log("当前账户 " + p + " 已授权\n祝使用愉快！");
      }
    }
  };
  const o = {
    encrypt: k,
    decrypt: l,
    getVer: m,
    getInfo: n
  };
  return o;
}