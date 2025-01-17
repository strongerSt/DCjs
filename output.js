//Fri Jan 17 2025 14:06:51 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
let body = $response.body;
if (body) try {
  let obj = JSON.parse(body);
  function modifyProperties(ilIIIiII) {
    if (typeof ilIIIiII === "object" && ilIIIiII !== null) {
      for (let i1l11Ili in ilIIIiII) {
        if (i1l11Ili === "price" && typeof ilIIIiII[i1l11Ili] === "number") ilIIIiII[i1l11Ili] = 0;else {
          if (i1l11Ili === "convertToVip" && ilIIIiII[i1l11Ili] === 0) ilIIIiII[i1l11Ili] = 1;else {
            if (i1l11Ili === "vipEnabled" && ilIIIiII[i1l11Ili] === true) ilIIIiII[i1l11Ili] = false;else {
              if (i1l11Ili === "subscriptionEnd") ilIIIiII[i1l11Ili] = {
                "__type": "Date",
                "iso": "2099-09-09T21:57:35.098Z"
              };else {
                if (i1l11Ili === "fuckyourmother") ilIIIiII[i1l11Ili] = "";else typeof ilIIIiII[i1l11Ili] === "object" && modifyProperties(ilIIIiII[i1l11Ili]);
              }
            }
          }
        }
      }
    }
  }
  modifyProperties(obj);
  body = JSON.stringify(obj);
} catch (liiiI1l1) {}
$done({
  "body": body
});