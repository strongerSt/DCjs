const { parse } = require('@babel/parser');
const generator = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

function decodePacker(code) {
    // 基础解码函数
    function decode(p, a, c, k, e, d) {
        e = function(c) {
            return (c < a ? '' : e(parseInt(c / a))) + 
                ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
        };
        d = {};
        while (c--) {
            if (k[c]) {
                d[e(c)] = k[c];
            }
        }
        return p.replace(/\b\w+\b/g, function(w) {
            return d.hasOwnProperty(w) ? d[w] : w;
        });
    }

    try {
        // 提取参数
        const pattern = /}\(([\s\S]+?)\)\)$/;
        const match = code.match(pattern);
        
        if (match) {
            const args = match[1].split(',');
            if (args.length >= 4) {
                // 解析参数
                const p = eval('(' + args[0] + ')');
                const a = parseInt(args[1]);
                const c = parseInt(args[2]);
                const k = eval('(' + args[3] + ')').split('|');
                
                // 执行解码
                return decode(p, a, c, k);
            }
        }
        return code;
    } catch (e) {
        console.error('Decode error:', e);
        return code;
    }
}

function plugin(code) {
    try {
        let result = code;
        let count = 0;
        const MAX_ITERATIONS = 5;

        while (count < MAX_ITERATIONS) {
            let changed = false;
            
            // 处理每一层eval
            if (result.includes('eval(function(p,a,c,k,e,d)')) {
                result = result.replace(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\(([\s\S]*?)\)\)/g, 
                    function(match) {
                        changed = true;
                        try {
                            return decodePacker(match);
                        } catch (e) {
                            console.error('Decode layer error:', e);
                            return match;
                        }
                    }
                );
            }
            
            if (!changed) break;
            count++;
            console.log(`Completed iteration ${count}`);
        }

        // 清理代码
        result = result
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');

        // 使用 Babel 格式化
        try {
            const ast = parse(result, { 
                sourceType: 'module',
                errorRecovery: true 
            });
            result = generator(ast, {
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

module.exports = plugin;
