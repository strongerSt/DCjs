//Mon Feb 24 2025 14:06:10 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const KuWoLe = new Env("酷我音乐");
const {
  encrypt,
  decrypt,
  getVer,
  getInfo
} = KuWoLF("影子");
const KuWoLf = "5.2.22-3";
const KuWoLg = KuWoLe.toObj(KuWoLe.getval("KuWo")) || {};
let KuWoLh = "undefined" !== typeof $request ? $request.url : "";
let KuWoLi = "undefined" !== typeof $response ? $response.body : null;
let KuWoLj = KuWoLe.toObj(KuWoLi);
const KuWoLl = {
  playInfo: /mobi\.s\?f\=kwxs/,
  userInfo: /vip\/enc/,
  bookVip: /(a\.p|v\d\/api\/(pay\/)?user\/info)/,
  vipTabInfo: /vip\/v\d\/user\/vip/,
  musicInfo: /music\.pay\?newver\=\d$/,
  vipTheme: /(commercia\/)?vip\/(v\d\/theme\?op\=gd|(player\/getStyleListByModel|hanger\/wear))/,
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
  payBox: /(sysinfo\?op\=getRePayAndDoPayBox(New)?&useNewHeadShow|openapi\/v\d\/recommend)/
};
const KuWoLn = {
  playInfo: KuWoLo,
  userInfo: KuWoLp,
  bookVip: KuWoLq,
  vipTabInfo: KuWoLr,
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
  payBox: KuWoLE
};
for (const [KuWoLH, KuWoLI] of Object.entries(KuWoLl)) {
  if (KuWoLI.test(KuWoLh)) {
    (async () => {
      await KuWoLn[KuWoLH](KuWoLH);
    })().catch(b => {
      KuWoLe.log("‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️", b.message);
    });
    break;
  }
}
async function KuWoLo(m) {
  try {
    {
      const {
        user,
        isVip,
        endTime,
        keys,
        PlayID,
        Song,
        ver
      } = KuWoLg;
      await getInfo(user, "kuwo");
      await getVer();
      if (isVip && new Date().getTime() < endTime && KuWoLf == ver && KuWoLj.code != 200) {
        {
          const q = keys[Math.floor(Math.random() * keys.length)];
          const r = decrypt(q);
          const s = {
            br: 4000,
            url: "4000kflac"
          };
          const t = {
            br: 2000,
            url: "2000kflac"
          };
          const u = {
            br: 320,
            url: "320kmp3"
          };
          const v = {
            br: 128,
            url: "128kmp3"
          };
          const w = {
            br: 100,
            url: "100kogg"
          };
          const x = {
            br: 96,
            url: "96kwma"
          };
          const y = {
            br: 48,
            url: "48kaac"
          };
          let z = [s, t, u, v, w, x, y];
          let A = 0;
          if ("undefined" !== typeof $argument) {
            {
              switch ($argument.QS) {
                case "无损音质":
                  A = 1;
                  break;
                case "超品音质":
                  A = 2;
                  break;
                case "高品音质":
                  A = 3;
                  break;
                default:
                  A = 0;
              }
            }
          }
          if ("book" == Song) {
            A = 2;
          }
          z = z.slice(A).concat(z.slice(0, A));
          A = 0;
          while (z[A]) {
            {
              const C = {
                url: "http://mobi.kuwo.cn/mobi.s?f=web&source=" + r + "&type=convert_url_with_sign&br=" + z[A].url + "&rid=" + PlayID
              };
              await KuWoLe.http.get(C).then(D => {
                {
                  KuWoLi = D.body;
                  KuWoLj = KuWoLe.toObj(KuWoLi);
                }
              });
              if (KuWoLj.data.bitrate == z[A].br) {
                break;
              }
              A++;
            }
          }
        }
      }
      const p = {
        body: KuWoLi
      };
      KuWoLe.done(p);
    }
  } catch (G) {
    {
      throw new Error("处理" + m + "时发生错误：" + KuWoLe.toStr(G));
    }
  }
}
async function KuWoLp(c) {
  try {
    {
      const g = new URL(KuWoLh).searchParams;
      let h = g.get("uid");
      if ("number" !== typeof h) {
        h = KuWoLh.replace(/.*?uid=(\d+).*/, "$1");
      }
      await getInfo(h, "kuwo");
      KuWoLi = await KuWoLe.http.get(KuWoLh.replace(/uid=\d+/g, "uid=8")).then(j => j.body);
      const i = {
        body: KuWoLi
      };
      KuWoLe.done(i);
    }
  } catch (k) {
    throw new Error("处理" + c + "时发生错误：" + KuWoLe.toStr(k));
  }
}
async function KuWoLq(c) {
  try {
    {
      if ("songs" in KuWoLj) {
        for (let h in KuWoLj.songs) {
          const i = KuWoLj.songs[h];
          const {
            id = KuWoLi.replace(/.*?\"id\":(\d+).*/, "$1")
          } = i;
          if ("number" == typeof id) {
            {
              KuWoLg.PlayID = id;
              KuWoLg.Song = "book";
              KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
              break;
            }
          }
        }
      }
      KuWoLi = KuWoLi.replace(/(policy|policytype)\":\d/g, "$1\":0").replace(/(playright|downright|type|bought|bought_vip|limitfree|vipType)\":\d/g, "$1\":1").replace(/(end|endtime|vipExpires|bought_vip_end)\":\d+/g, "$1\":4077187200");
      const g = {
        body: KuWoLi
      };
      KuWoLe.done(g);
    }
  } catch (l) {
    throw new Error("处理" + c + "时发生错误：" + KuWoLe.toStr(l));
  }
}
async function KuWoLr() {
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
async function KuWoLs(c) {
  const g = h => {
    {
      for (let k in h) {
        {
          if (typeof h[k] === "string" && h[k].includes("1")) {
            {
              h[k] = h[k].replace(/1/g, "0");
            }
          } else {
            if (typeof h[k] === "object" && h[k] !== null) {
              {
                g(h[k]);
              }
            }
          }
        }
      }
    }
  };
  try {
    {
      if ("songs" in KuWoLj && Array.isArray(KuWoLj.songs)) {
        {
          const {
            id = KuWoLi.replace(/.*?\"id\":(\d+).*/, "$1")
          } = KuWoLj.songs[0];
          KuWoLg.PlayID = parseInt(id);
          KuWoLg.Song = "music";
          KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
          g(KuWoLj.songs[0].payInfo);
          if ("audio" in KuWoLj.songs[0] && Array.isArray(KuWoLj.songs[0].audio)) {
            {
              KuWoLj.songs[0].audio.forEach(l => l.st = 0);
              let k = KuWoLj.songs[0].audio[0].policy;
              KuWoLj.user[0] = {
                pid: KuWoLj.songs[0].audio[0].pid,
                type: k,
                name: k + "_1",
                categray: k + "_1",
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
      }
      KuWoLi = KuWoLe.toStr(KuWoLj);
      const h = {
        body: KuWoLi
      };
      KuWoLe.done(h);
    }
  } catch (m) {
    {
      throw new Error("处理" + c + "时发生错误：" + KuWoLe.toStr(m));
    }
  }
}
async function KuWoLt() {
  if ("vipTheme" in KuWoLj.data) {
    {
      KuWoLj.data.vipTheme.type = "free";
      delete KuWoLj.data.needBieds;
      KuWoLi = KuWoLe.toStr(KuWoLj);
    }
  } else {
    if ("needBied" in KuWoLj.data) {
      const i = {
        requestUrl: "",
        btnText: null,
        rightStatus: 1,
        requestUrlType: 1
      };
      Object.assign(KuWoLj.data.needBied, i);
      KuWoLi = KuWoLe.toStr(KuWoLj);
    } else {
      {
        KuWoLi = KuWoLi.replace(/\"(paymentType)\":\d/g, "\"$1\":0").replace(/(umpUrl)\":\".*?\"/g, "$1\":\"\"");
      }
    }
  }
  const f = {
    body: KuWoLi
  };
  KuWoLe.done(f);
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
  KuWoLj.data.list[1].route.params.url = "https://yingzi-0gwxqpln4f7a7fda-1251393964.ap-shanghai.app.tcloudbase.com/authPay?action=kuwo&user=" + KuWoLg.user;
  if (KuWoLg.endTime) {
    {
      KuWoLj.data.list[1].title = "授权至：";
      KuWoLj.data.list[1].description = KuWoLe.time("yyyy-MM-dd", KuWoLg.endTime);
      KuWoLj.data.list[1].route.params.url = "https://t.me/Napi_Group";
    }
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLx() {
  let e = ["发现", "推荐", "听书", "看短剧"];
  let f = 0;
  while (KuWoLj.data.homeTop[f]) {
    {
      if (!e.includes(KuWoLj.data.homeTop[f].title)) {
        delete KuWoLj.data.homeTop[f];
      }
      f++;
    }
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
    i.nMSij = "$1\":\"\"";
    i.TYltH = "homeTop";
    const j = i;
    {
      for (let k in h) {
        {
          if (typeof h[k] === "string") {
            {
              if (k.includes("btnText")) {
                {
                  h[k] = KuWoLg.endTime && "超级会员" || "未授权";
                }
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
    {
      if (typeof i === "string") {
        {
          i = [i];
        }
      }
      for (let n in h) {
        {
          if (!i.includes(n)) {
            {
              delete h[n];
            }
          }
        }
      }
    }
  };
  if ("data" in KuWoLj) {
    {
      const h = ["subConfigType", "tsAdBarInfoV2"];
      f(KuWoLj.data, h);
      f(KuWoLj.data.tsAdBarInfoV2, "tsHomeWeex");
      e(KuWoLj.data);
    }
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
    {
      if (e.some(h => KuWoLj.data.child[f].label.includes(h))) {
        delete KuWoLj.data.child[f].child;
      }
      f++;
    }
  }
  KuWoLi = KuWoLe.toStr(KuWoLj);
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
async function KuWoLA() {
  if ("tab" in KuWoLj.data) {
    KuWoLj.data.tab.vipTypes[0].topics[0].url = "https://h5app.kuwo.cn/pay/viptab/index.html";
    let f = 1;
    while (KuWoLj.data.tab.vipTypes[0].topics[f]) {
      {
        delete KuWoLj.data.tab.vipTypes[0].topics[f];
        f++;
      }
    }
  } else {
    if (Array.isArray(KuWoLj.data)) {
      {
        KuWoLj.data[1].data;
        let j = ["会员福利"];
        let k = 0;
        while (KuWoLj.data[k]) {
          {
            if (j.some(l => KuWoLj.data[k].title.includes(l))) {
              delete KuWoLj.data[k].data;
            }
            k++;
          }
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
    {
      if (g in KuWoLj) {
        {
          delete KuWoLj[g];
        }
      }
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
    {
      KuWoLi = KuWoLi.replace(/<section.*?\/userinfolabel><\/section>/, "");
    }
  }
  const e = {
    body: KuWoLi
  };
  KuWoLe.done(e);
}
async function KuWoLE(c) {
  const e = {
    ZFUav: "</body>",
    RySpS: function (h, i) {
      return h in i;
    },
    LoYCm: "free",
    KEYiT: function (h, i) {
      return h in i;
    },
    sKEAy: "\"$1\":0",
    EMluU: "$1\":\"\"",
    cLhRi: function (h, i) {
      return h !== i;
    },
    Ypvuw: "XuRCN",
    jCKeW: "ZheGY",
    adQCT: "zVniC",
    YzfII: "string",
    ZDZIT: function (h, i) {
      return h === i;
    },
    ULzqP: "object",
    xqQnN: "KtHdb",
    wfoVP: "kPNDL",
    mUEiA: function (h, i) {
      return h(i);
    },
    ojDEn: function (h, i) {
      return h < i;
    },
    wevNA: function (h, i) {
      return h % i;
    },
    aDBgz: function (h, i) {
      return h >= i;
    },
    lOkHA: function (h, i) {
      return h(i);
    },
    ECWaz: function (h, i) {
      return h in i;
    },
    jPmhl: "zuYfb",
    TiSdX: "dKeKs",
    eiNCN: "\"$1\":null",
    VUZVu: function (h, i) {
      return h(i);
    }
  };
  const f = h => {
    {
      for (let i in h) {
        {
          if (typeof h[i] === "string") {
            h[i] = null;
          } else {
            if (typeof h[i] === "object" && h[i] !== null) {
              {
                f(h[i]);
              }
            }
          }
        }
      }
    }
  };
  if ("child" in KuWoLj) {
    {
      KuWoLi = KuWoLi.replace(/\"(btnTipText|jumpUrl|tipText)\":\".*?\"/g, "\"$1\":null");
    }
  } else {
    f(KuWoLj);
    KuWoLi = KuWoLe.toStr(KuWoLj);
  }
  const g = {
    body: KuWoLi
  };
  KuWoLe.done(g);
}
function KuWoLF(e = "YingZi") {
  const k = p => {
    let s = new TextEncoder().encode(p);
    let t = new TextEncoder().encode(e);
    let u = new Uint8Array(s.length);
    for (let v = 0; v < s.length; v++) {
      let w = s[v] ^ t[v % t.length];
      while (w >= 256) {
        {
          w %= 256;
        }
      }
      u[v] = w;
    }
    return btoa(String.fromCharCode(...u));
  };
  const l = p => {
    {
      let s = new TextEncoder().encode(e);
      let t = new Uint8Array(atob(p).split("").map(v => v.charCodeAt(0)));
      let u = new Uint8Array(t.length);
      for (let v = 0; v < t.length; v++) {
        {
          let w = t[v] ^ s[v % s.length];
          while (w >= 256) {
            {
              w %= 256;
            }
          }
          u[v] = w;
        }
      }
      return new TextDecoder().decode(u);
    }
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
    {
      let t = "type=" + q + "&user=" + p;
      if (!KuWoLg.user || p != KuWoLg.user || !KuWoLg.endTime || new Date().getTime() > KuWoLg.endTime || !KuWoLg.keys || KuWoLg.ver !== KuWoLf) {
        KuWoLe.log("正在获取 " + p + " 的授权信息…");
        const u = {
          url: "https://yingzi-0gwxqpln4f7a7fda-1251393964.ap-shanghai.app.tcloudbase.com/getInfo",
          body: t
        };
        let v = KuWoLe.toObj(await KuWoLe.http.post(u).then(w => w.body));
        for (let w in v) {
          {
            if (v.hasOwnProperty(w)) {
              {
                KuWoLg[w] = v[w];
              }
            }
          }
        }
        KuWoLe.setval(KuWoLe.toStr(KuWoLg), "KuWo");
        KuWoLe.log("数据获取完成...");
        if (v.isVip) {
          {
            let A = KuWoLe.time("yyyy-MM-dd HH:mm", KuWoLg.endTime);
            if (KuWoLf != KuWoLg.ver) {
              {
                A += "\n需要更新 -> 请更新你的脚本！";
              }
            }
            KuWoLe.log("当前账户 " + p + " 已授权\n授权有效期至：" + A);
            KuWoLe.msg("当前账户 " + p + " 已授权", "", "授权有效期至：" + A);
          }
        } else {
          {
            KuWoLe.log("未能获取到当前账户 " + p + " 的授权信息\n即将再次获取你的授权信息");
            const C = {
              "open-url": "kwapp://open?t=27&u=https%3A%2F%2Fyingzi-0gwxqpln4f7a7fda-1251393964.ap-shanghai.app.tcloudbase.com%2FauthPay%3Faction%3Dkuwo%26user%3D" + p,
              "media-url": "https://file.napi.ltd/Static/Image/KuWo.png"
            };
            KuWoLe.msg("未获取到授权信息", "", "请重启应用或点击本条通知获取授权码", C);
          }
        }
      } else {
        {
          KuWoLe.log("当前账户 " + p + " 已授权\n祝使用愉快！");
        }
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