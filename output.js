//Wed Apr 16 2025 11:25:54 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
//Generated at 2025-04-16T11:25:54.457Z
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action

// 基础配置变量
let names = "ColorIdentifier";
let productName = "proversion";
let productType = "color_identifier_pro";
let appVersion = null;
let notifyState = true;
let ua = true;
let obj = JSON.parse($response.body);
let $ = new Env(names);
// 订阅配置
obj.subscriber = {
    non_subscriptions: {},
    first_seen: "2024-03-08T04:44:30Z",
    original_application_version: appVersion,
    other_purchases: {
    [productType]: {
        price: {
          amount: 0,
          currency: "USD"
      },
        display_name: null,
        purchase_date: "2024-03-08T04:44:44Z"
    }
  },
    management_url: null,
    subscriptions: {},
    entitlements: {},
    original_purchase_date: "2024-03-08T04:44:14Z",
    original_app_user_id: "$RCAnonymousID:0400000000000000000000000000000",
    last_seen: "2024-03-08T04:44:30Z"
};
obj.subscriber.non_subscriptions[productType] = [{
    id: "aaaaaaaaaa",
    is_sandbox: false,
    price: {
      amount: 0,
      currency: "USD"
  },
    display_name: null,
    purchase_date: "2024-03-08T04:44:44Z",
    original_purchase_date: "2024-03-08T04:44:44Z",
    store: "app_store",
    store_transaction_id: "280000000000000"
}];
obj.subscriber.entitlements[productName] = {
    grace_period_expires_date: null,
    purchase_date: "2024-03-08T04:44:44Z",
    product_identifier: productType,
    expires_date: null
};
// 通知配置
$.notify("XiaoMao_" + names + " 执行成功！", "", "Nice!已解锁成功，可关掉此脚本。", "https://i.pixiv.re/img-original/img/2022/12/19/00/06/12/103718184_p0.png");
$done({
    body: JSON.stringify(obj)
});
function Env(name) {
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  const isQX = typeof $task !== "undefined";
  const read = key => {
    if (isLoon || isSurge) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
  };
  const write = (key, value) => {
    if (isLoon || isSurge) return $persistentStore.write(key, value);
    if (isQX) return $prefs.setValueForKey(key, value);
  };
  const notify = (title = "XiaoMao", subtitle = "", message = "", url = "", url2 = url) => {
    if (isLoon) $notification.post(title, subtitle, message, url);
    if (isSurge) $notification.post(title, subtitle, message, {
      url
    });
    if (isQX) $notify(title, subtitle, message, {
      "open-url": url,
      "media-url": url2
    });
  };
  const get = (url, callback) => {
    if (isLoon || isSurge) $httpClient.get(url, callback);
    if (isQX) {
      url.method = `GET`;
      $task.fetch(url).then(resp => callback(null, {}, resp.body));
    }
  };
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) {
      url.method = `POST`;
      $task.fetch(url).then(resp => callback(null, {}, resp.body));
    }
  };
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback);
    if (isQX) {
      url.method = "PUT";
      $task.fetch(url).then(resp => callback(null, {}, resp.body));
    }
  };
  const toObj = str => JSON.parse(str);
  const toStr = obj => JSON.stringify(obj);
  const queryStr = obj => {
    return Object.keys(obj).map(key => `${key}=${obj[key]}`).join("&");
  };
  const log = message => console.log(message);
  const done = (value = {}) => $done(value);
  return {
    name,
    read,
    write,
    notify,
    get,
    post,
    put,
    toObj,
    toStr,
    queryStr,
    log,
    done
  };
}