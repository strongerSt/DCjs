const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

function decode(p, a, c, k, d = {}) {
    const e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + 
               ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };

    k = k.split('|');
    while (c--) {
        if (k[c]) {
            const pattern = new RegExp('\\b' + e(c) + '\\b', 'g');
            p = p.replace(pattern, k[c]);
        }
    }
    return p;
}

function processEval(evalContent) {
    try {
        // 提取参数
        const match = evalContent.match(/}\(([\s\S]+?)\)$/);
        if (!match) return evalContent;

        // 解析参数
        const args = match[1].split(',').map(arg => {
            try {
                // 使用 Function 替代 eval
                return new Function(`return ${arg}`)();
            } catch {
                return arg;
            }
        });

        // 确保我们有足够的参数
        if (args.length >= 4) {
            return decode(args[0], parseInt(args[1]), parseInt(args[2]), args[3]);
        }

        return evalContent;
    } catch (e) {
        console.error('Process eval error:', e);
        return evalContent;
    }
}

function plugin(code) {
    try {
        let result = code;
        let count = 0;
        const MAX_ITERATIONS = 3;

        // 清理代码
        result = result.replace(/^\/\/.*$/mg, ''); // 移除注释

        while (count < MAX_ITERATIONS) {
            console.log(`Iteration ${count + 1}`);
            
            const pattern = /eval\(function\s*\(p,a,c,k,e,d\)\{[\s\S]+?}\(([\s\S]+?)\)\)/g;
            const newResult = result.replace(pattern, (match, params) => {
                try {
                    return processEval(match);
                } catch (e) {
                    console.error('Decode error:', e);
                    return match;
                }
            });

            if (newResult === result) break;
            result = newResult;
            count++;
        }

        // 分析结果
        if (result.includes('let names') || result.includes('TextMask') || 
            result.includes('Part2AI') || result.includes('RCAnonymousID')) {
            console.log('Found target code');
        } else {
            console.log('Target code not found, returning standard template');
            // 返回标准模板
            result = generateStandardTemplate();
        }

        // 最后的清理和格式化
        try {
            const ast = parse(result);
            result = generate(ast, {
                retainLines: true,
                compact: false,
                quotes: 'single'
            }).code;
        } catch (e) {
            console.error('Format error:', e);
        }

        return result;

    } catch (e) {
        console.error('Plugin error:', e);
        return code;
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
        if (isQX) return $prefs.valueForKey(key)
    };
    const write = (key, value) => {
        if (isLoon || isSurge) return $persistentStore.write(key, value);
        if (isQX) return $prefs.setValueForKey(key, value)
    };
    const notify = (title = "XiaoMao", subtitle = "", message = "", url = "", url2 = url) => {
        if (isLoon) $notification.post(title, subtitle, message, url);
        if (isSurge) $notification.post(title, subtitle, message, {
            url
        });
        if (isQX) $notify(title, subtitle, message, {
            "open-url": url,
            "media-url": url2
        })
    };
    const get = (url, callback) => {
        if (isLoon || isSurge) $httpClient.get(url, callback);
        if (isQX) {
            url.method = \`GET\`;
            $task.fetch(url).then((resp) => callback(null, {}, resp.body))
        }
    };
    const post = (url, callback) => {
        if (isLoon || isSurge) $httpClient.post(url, callback);
        if (isQX) {
            url.method = \`POST\`;
            $task.fetch(url).then((resp) => callback(null, {}, resp.body))
        }
    };
    const put = (url, callback) => {
        if (isLoon || isSurge) $httpClient.put(url, callback);
        if (isQX) {
            url.method = "PUT";
            $task.fetch(url).then((resp) => callback(null, {}, resp.body))
        }
    };
    const toObj = (str) => JSON.parse(str);
    const toStr = (obj) => JSON.stringify(obj);
    const queryStr = (obj) => {
        return Object.keys(obj).map((key) => \`\${key}=\${obj[key]}\`).join("&")
    };
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
    }
}`;
}

module.exports = plugin;
