//Tue Mar 04 2025 09:33:20 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
//Generated at 2025-03-04T09:33:20.893Z
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action

// 基础配置变量
let names = "Video2Photo";
let productName = "com.mike.Video2Photo";
let productType = "6740474392";
let appVersion = "4";
let notifyState = true;
let ua = false;
let obj = JSON.parse($response.body);
let requestUrl = $request.url;
let $ = new Env(names);
if (/^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt?/.test(requestUrl) && (ua ? $request.headers["User-Agent"].includes(names) : true)) {
  let receipt = {
      receipt_type: "Production",
      bundle_id: productName,
      in_app: [{
        quantity: "1",
        transaction_id: "666666666666667",
        original_transaction_id: "666666666666667",
        product_id: productType,
        in_app_ownership_type: "PURCHASED",
        purchase_date: "2024-04-14 15:27:40 Etc/GMT",
        purchase_date_ms: "1691972860000",
        purchase_date_pst: "2024-04-14 08:27:40 America/Los_Angeles",
        original_purchase_date: "2024-04-14 08:24:40 Etc/GMT",
        original_purchase_date_ms: "1692026680000",
        original_purchase_date_pst: "2024-04-14 08:24:40 America/Los_Angeles",
        expires_date: "2222-02-02 02:02:02 Etc/GMT",
        expires_date_pst: "2222-02-02 02:02:02 America/Los_Angeles",
        expires_date_ms: "7955085722000"
    }],
      adam_id: 1111111111,
      receipt_creation_date_pst: "2024-04-14 08:25:04 America/Los_Angeles",
      request_date: "2024-04-14 15:27:40 Etc/GMT",
      request_date_pst: "2024-04-14 08:27:40 America/Los_Angeles",
      version_external_identifier: 666666666,
      request_date_ms: "1692026860531",
      original_purchase_date_pst: "2024-04-14 08:24:40 America/Los_Angeles",
      application_version: appVersion,
      original_purchase_date_ms: "1692026680000",
      receipt_creation_date_ms: "1691972704000",
      original_application_version: appVersion,
      download_id: 666666666666666666,
      latest_receipt_info: [{
        quantity: "1",
        transaction_id: "666666666666667",
        original_transaction_id: "666666666666667",
        product_id: productType,
        in_app_ownership_type: "PURCHASED",
        is_in_intro_offer_period: "false",
        is_trial_period: "false",
        purchase_date: "2024-04-14 15:27:40 Etc/GMT",
        purchase_date_ms: "1691972860000",
        purchase_date_pst: "2024-04-14 08:27:40 America/Los_Angeles",
        original_purchase_date: "2024-04-14 08:24:40 Etc/GMT",
        original_purchase_date_ms: "1692026680000",
        original_purchase_date_pst: "2024-04-14 08:24:40 America/Los_Angeles",
        expires_date: "2222-02-02 02:02:02 Etc/GMT",
        expires_date_pst: "2222-02-02 02:02:02 America/Los_Angeles",
        expires_date_ms: "7955085722000"
    }],
      pending_renewal_info: [{
        product_id: productName,
        original_transaction_id: "666666666666667",
        auto_renew_product_id: productType,
        auto_renew_status: "1"
    }],
      status: 0,
      environment: "Production"
  };
  obj.latest_receipt_info = receipt.latest_receipt_info;
  obj.latest_receipt = "";
  obj.pending_renewal_info = receipt.pending_renewal_info;
  obj.receipt = receipt;
  if (notifyState) {
    // 通知配置
$.notify("XiaoMao_" + names + " 执行成功！", "", "Nice!已解锁成功，可关掉此脚本。", "https://i.pixiv.re/img-original/img/2021/08/01/01/43/03/91637959_p0.jpg");
  }
}
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