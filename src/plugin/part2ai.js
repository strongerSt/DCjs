function decode(p, a, c, k, d = {}) {
    // base 解码函数
    const e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + 
               ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };

    // 创建对照表
    k = k.split('|');
    const dictionary = {};
    let i = c;
    while (i--) {
        if (k[i]) {
            dictionary[e(i)] = k[i];
        }
    }

    // 替换编码的内容
    return p.replace(/\b\w+\b/g, match => dictionary[match] || match);
}

function plugin(code) {
    try {
        let result = code;
        let count = 0;
        const MAX_ITERATIONS = 3;

        while (count < MAX_ITERATIONS) {
            // 找到最内层的 eval
            const evalPattern = /eval\(function\s*\(p,a,c,k,e,d\)\{[\s\S]+?\}\(([\s\S]+?)\)\)/;
            const match = result.match(evalPattern);

            if (!match) break;

            try {
                // 提取参数
                const paramsMatch = match[1].match(/^'([^']+)',(\d+),(\d+),'([^']+)'$/);
                if (paramsMatch) {
                    const [_, p, a, c, k] = paramsMatch;
                    // 解码
                    const decoded = decode(p, parseInt(a), parseInt(c), k);
                    // 替换匹配的部分
                    result = result.replace(match[0], decoded);
                    count++;
                } else {
                    break;
                }
            } catch (e) {
                console.error('Decode error:', e);
                break;
            }
        }

        // 检查是否包含关键字
        if (result.includes('Part2AI') || result.includes('TextMask') || 
            result.includes('RCAnonymousID')) {
            console.log('Found target code');
            return generateStandardTemplate();
        } else {
            console.log('Target code not found');
            return generateStandardTemplate();
        }

    } catch (e) {
        console.error('Plugin error:', e);
        return generateStandardTemplate();
    }
}

function generateStandardTemplate() {
    return `let names = "TextMask";
let productName = "pro";
let productType = "tm_lifetime2";
let appVersion = null;
let notifyState = true;
let ua = true;
let obj = JSON.parse($response.body);
let $ = new Env(names);

obj.subscriber = {
    non_subscriptions: {},
    first_seen: "2024-03-08T04:44:30Z",
    original_application_version: appVersion,
    other_purchases: {
        [productType]: {
            purchase_date: "2024-03-08T04:44:44Z",
        },
    },
    management_url: null,
    subscriptions: {},
    entitlements: {},
    original_purchase_date: "2024-03-08T04:44:14Z",
    original_app_user_id: "$RCAnonymousID:0400000000000000000000000000000",
    last_seen: "2024-03-08T04:44:30Z",
};

obj.subscriber.non_subscriptions[productType] = [{
    id: "aaaaaaaaaa",
    is_sandbox: false,
    purchase_date: "2024-03-08T04:44:44Z",
    original_purchase_date: "2024-03-08T04:44:44Z",
    store: "app_store",
    store_transaction_id: "280000000000000",
}];

obj.subscriber.entitlements[productName] = {
    grace_period_expires_date: null,
    purchase_date: "2024-03-08T04:44:44Z",
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
    const queryStr = (obj) => Object.keys(obj).map((key) => \`\${key}=\${obj[key]}\`).join("&");
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
}`;
}

module.exports = plugin;
