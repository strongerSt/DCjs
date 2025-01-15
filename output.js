//Wed Jan 15 2025 11:16:34 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
let names = "";
let productName = "";
let productType = "";
let appVersion = null;
let notifyState = true;
let ua = true;
let obj = JSON.parse($response.body);
let $ = new Env(names);

obj.subscriber = {
    non_subscriptions: {},
    first_seen: "",
    original_application_version: appVersion,
    other_purchases: {
        [productType]: {
            purchase_date: "",
        },
    },
    management_url: null,
    subscriptions: {},
    entitlements: {},
    original_purchase_date: "",
    original_app_user_id: "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||return|function|if|replace|while|String|fromCharCode|toString|eval|parseInt|RegExp|split|new|let|123|url|const|obj|key|callback|isLoon|null|isSurge|03|08T04|productType|isQX|resp|message|value|post|body|subtitle|appVersion|2024|task|str|img|257|names|purchase_date|read|write|typeof|undefined|get|put|notify|method|fetch|then|JSON|subscriber|prefs|30Z|non_subscriptions|parse|entitlements|original_purchase_date|persistentStore|Env|title|notification|log|44Z|httpClient|done|103718184_p0|name|toStr|productName|true|expires_date|store|280000000000000|store_transaction_id|grace_period_expires_date|app_store|false|14Z|aaaaaaaaaa|console|response|queryStr|tm_lifetime2|notifyState|first_seen|management_url|last_seen|0400000000000000000000000000000|RCAnonymousID|id|subscriptions|other_purchases|stringify|is_sandbox|original_app_user_id|ua|loon|original_application_version|执行成功|valueForKey|toObj|setValueForKey|open|media|GET|PUT|Object|keys|map|join|POST|product_identifier|png|TextMask|XiaoMao||00|06|Nice|可关掉此脚本|url2|https|pro|已解锁成功|pixiv|re|original|2022|XiaoMao_",
    last_seen: "",
};

obj.subscriber.non_subscriptions[productType] = [{
    id: "",
    is_sandbox: false,
    purchase_date: "",
    original_purchase_date: "",
    store: "app_store",
    store_transaction_id: "",
}];

obj.subscriber.entitlements[productName] = {
    grace_period_expires_date: null,
    purchase_date: "",
    product_identifier: productType,
    expires_date: null,
};

$.notify("XiaoMao_" + names + " 执行成功！", "", "Nice!已解锁成功，可关掉此脚本。", "https://i.pixiv.re/img-original/img/2022/12/19/00/06/12/103718184_p0.png");

$done({
    body: JSON.stringify(obj)
});


function Env(name) {
    const isLoon = typeof $loon !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isQX = typeof $task !== "undefined";

    const read = (key) => {
        if (isLoon || isSurge) return $persistentStore.read(key);
        if (isQX) return $prefs.valueForKey(key);
    };

    const write = (key, value) => {
        if (isLoon || isSurge) return $persistentStore.write(key, value);
        if (isQX) return $prefs.setValueForKey(key, value);
    };

    const notify = (title = "XiaoMao", subtitle = "", message = "", url = "", url2 = url) => {
        if (isLoon) $notification.post(title, subtitle, message, url);
        if (isSurge) $notification.post(title, subtitle, message, { url });
        if (isQX) $notify(title, subtitle, message, {
            "open-url": url,
            "media-url": url2
        });
    };

    const get = (url, callback) => {
        if (isLoon || isSurge) $httpClient.get(url, callback);
        if (isQX) {
            url.method = "GET";
            $task.fetch(url).then((resp) => callback(null, {}, resp.body));
        }
    };

    const post = (url, callback) => {
        if (isLoon || isSurge) $httpClient.post(url, callback);
        if (isQX) {
            url.method = "POST";
            $task.fetch(url).then((resp) => callback(null, {}, resp.body));
        }
    };

    const put = (url, callback) => {
        if (isLoon || isSurge) $httpClient.put(url, callback);
        if (isQX) {
            url.method = "PUT";
            $task.fetch(url).then((resp) => callback(null, {}, resp.body));
        }
    };

    const toObj = (str) => JSON.parse(str);
    const toStr = (obj) => JSON.stringify(obj);
    const queryStr = (obj) => Object.keys(obj).map((key) => `${key}=${obj[key]}`).join("&");
    const log = (message) => console.log(message);
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
        done,
    };
}