function decode(p, a, c, k, e, d) {
    d = {};
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) +
            ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };

    if (!''.replace(/^/, String)) {
        while (c--) {
            d[e(c)] = k[c] || e(c);
        }
        k = [function(e) {
            return d[e];
        }];
        e = function() {
            return '\\w+';
        };
        c = 1;
    }

    while (c--) {
        if (k[c]) {
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        }
    }
    return p;
}

function plugin(code) {
    try {
        let result = code;
        // 移除头部注释和配置
        result = result.replace(/^\/\/.*\n/gm, '');
        result = result.replace(/^\/\/ Part2AI.*\n/gm, '');

        // 提取并处理eval函数
        const pattern = /eval\(function\(p,a,c,k,e,d\)\{([\s\S]+?)\}\(([\s\S]+?)\)\)/g;
        
        while (pattern.test(result)) {
            result = result.replace(pattern, (match, body, args) => {
                try {
                    // 分割参数
                    const params = args.split(',').map(arg => {
                        try {
                            return Function(`return ${arg}`)();
                        } catch {
                            return arg;
                        }
                    });
                    
                    // 使用decode函数解码
                    return decode(params[0], params[1], params[2], params[3].split('|'));
                } catch (e) {
                    console.error('Decode error:', e);
                    return match;
                }
            });
        }

        // 清理代码
        result = result
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');

        return result;
    } catch (e) {
        console.error('Plugin error:', e);
        return code;
    }
}

module.exports = plugin;
