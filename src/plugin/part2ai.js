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
    const dictionary = {};
    let i = c;
    while (i--) {
        if (k[i]) {
            dictionary[e(i)] = k[i];
        }
    }

    return p.replace(/\b\w+\b/g, match => dictionary[match] || match);
}

function extractConfig(code) {
    try {
        const config = {
            names: "",
            productName: "",
            productType: "",
            appVersion: null,
            dates: {
                first_seen: "",
                purchase_date: "",
                original_purchase_date: ""
            },
            store: {
                id: "",
                transaction_id: ""
            },
            urls: [],
            user_id: ""
        };

        // 提取所有字符串字面量
        const ast = parse(code);
        traverse(ast, {
            StringLiteral(path) {
                const value = path.node.value;
                
                // 提取日期
                if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
                    if (!config.dates.first_seen) {
                        config.dates.first_seen = value;
                    } else if (!config.dates.purchase_date) {
                        config.dates.purchase_date = value;
                    } else if (!config.dates.original_purchase_date) {
                        config.dates.original_purchase_date = value;
                    }
                }
                
                // 提取 URL
                if (value.startsWith('http')) {
                    config.urls.push(value);
                }
                
                // 提取 ID
                if (value.match(/^[a-zA-Z0-9]{10}$/)) {
                    config.store.id = value;
                }
                
                // 提取 user_id
                if (value.includes('RCAnonymousID')) {
                    config.user_id = value;
                }
                
                // 提取 names
                if (path.parent.type === 'VariableDeclarator' && 
                    path.parent.id.name === 'names') {
                    config.names = value;
                }
                
                // 提取 product 信息
                if (path.parent.type === 'VariableDeclarator') {
                    if (path.parent.id.name === 'productName') {
                        config.productName = value;
                    }
                    if (path.parent.id.name === 'productType') {
                        config.productType = value;
                    }
                }
            },
            
            NumericLiteral(path) {
                const value = path.node.value;
                if (value.toString().length >= 15) {
                    config.store.transaction_id = value.toString();
                }
            }
        });

        return config;
    } catch (e) {
        console.error('Extract config error:', e);
        return null;
    }
}

function plugin(code) {
    try {
        let result = code;
        let count = 0;
        const MAX_ITERATIONS = 3;

        // 解密过程
        while (count < MAX_ITERATIONS) {
            const evalPattern = /eval\(function\s*\(p,a,c,k,e,d\)\{[\s\S]+?\}\(([\s\S]+?)\)\)/;
            const match = result.match(evalPattern);

            if (!match) break;

            try {
                const paramsMatch = match[1].match(/^'([^']+)',(\d+),(\d+),'([^']+)'$/);
                if (paramsMatch) {
                    const [_, p, a, c, k] = paramsMatch;
                    const decoded = decode(p, parseInt(a), parseInt(c), k);
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

        // 提取配置
        const config = extractConfig(result);
        
        if (!config) {
            console.log('Unable to extract config, using default template');
            return generateTemplate();
        }

        // 使用提取的配置生成代码
        return generateTemplate(config);

    } catch (e) {
        console.error('Plugin error:', e);
        return generateTemplate();
    }
}

function generateTemplate(config = {}) {
    // 使用默认值
    const defaultConfig = {
        names: "TextMask",
        productName: "pro",
        productType: "tm_lifetime2",
        appVersion: null,
        dates: {
            first_seen: "2024-03-08T04:44:30Z",
            purchase_date: "2024-03-08T04:44:44Z",
            original_purchase_date: "2024-03-08T04:44:14Z"
        },
        store: {
            id: "aaaaaaaaaa",
            transaction_id: "280000000000000"
        },
        urls: ["https://i.pixiv.re/img-original/img/2022/12/19/00/06/12/103718184_p0.png"],
        user_id: "$RCAnonymousID:0400000000000000000000000000000"
    };

    // 合并配置
    const finalConfig = {
        ...defaultConfig,
        ...config,
        dates: { ...defaultConfig.dates, ...config.dates },
        store: { ...defaultConfig.store, ...config.store },
        urls: config.urls?.length ? config.urls : defaultConfig.urls
    };

    return `let names = "${finalConfig.names}";
let productName = "${finalConfig.productName}";
let productType = "${finalConfig.productType}";
let appVersion = ${finalConfig.appVersion === null ? 'null' : `"${finalConfig.appVersion}"`};
let notifyState = true;
let ua = true;
let obj = JSON.parse($response.body);
let $ = new Env(names);

obj.subscriber = {
    non_subscriptions: {},
    first_seen: "${finalConfig.dates.first_seen}",
    original_application_version: appVersion,
    other_purchases: {
        [productType]: {
            purchase_date: "${finalConfig.dates.purchase_date}",
        },
    },
    management_url: null,
    subscriptions: {},
    entitlements: {},
    original_purchase_date: "${finalConfig.dates.original_purchase_date}",
    original_app_user_id: "${finalConfig.user_id}",
    last_seen: "${finalConfig.dates.first_seen}",
};

obj.subscriber.non_subscriptions[productType] = [{
    id: "${finalConfig.store.id}",
    is_sandbox: false,
    purchase_date: "${finalConfig.dates.purchase_date}",
    original_purchase_date: "${finalConfig.dates.purchase_date}",
    store: "app_store",
    store_transaction_id: "${finalConfig.store.transaction_id}",
}];

obj.subscriber.entitlements[productName] = {
    grace_period_expires_date: null,
    purchase_date: "${finalConfig.dates.purchase_date}",
    product_identifier: productType,
    expires_date: null,
};

$.notify("XiaoMao_" + names + " 执行成功！", "", "Nice!已解锁成功，可关掉此脚本。", "${finalConfig.urls[0]}");

$done({
    body: JSON.stringify(obj)
});

${generateEnvFunction()}`;
}

function generateEnvFunction() {
    return `
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
