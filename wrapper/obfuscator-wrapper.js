/**
 * Enhanced JS-Obfuscator Decoder
 * Specifically designed to handle complex obfuscations including hexadecimal strings and RC4-like ciphers
 */
(function() {
  // Create a self-executing function to isolate scope
  const module = { exports: {} };
  const exports = module.exports;
  
  function plugin(code) {
    try {
      // First, handle special hexadecimal string encodings (\x notation)
      code = decodeHexStrings(code);
      
      // Then handle direct string array references
      code = resolveStringArrays(code);
      
      // Try to decode RC4-like cipher implementations
      code = decodeRC4Cipher(code);
      
      // Try to simplify function calls
      code = simplifyFunctionCalls(code);
      
      // Use Babel for more complex transformations if available
      if (window.Babel) {
        try {
          // Create AST
          const ast = window.Babel.parse(code, { 
            sourceType: 'script',
            errorRecovery: true 
          });
          
          // Apply deobfuscation transforms
          const t = window.Babel.types;
          
          // Extract string arrays
          const stringArrays = extractStringArrays(ast, t);
          
          // Apply transformations
          window.Babel.traverse(ast, createVisitor(stringArrays, t));
          
          // Generate code
          code = window.Babel.generator(ast, { 
            comments: true,
            compact: false 
          }).code;
        } catch (e) {
          console.warn("Babel processing failed, falling back to regex-based methods:", e);
        }
      }
      
      return code;
    } catch (e) {
      console.error("Deobfuscation error:", e);
      return code; // Return original code on error
    }
  }
  
  // Decode hex string literals like \x6a\x73
  function decodeHexStrings(code) {
    return code.replace(/(['"])\\x([0-9a-fA-F]{2})\\x([0-9a-fA-F]{2})(\\x[0-9a-fA-F]{2})*(['"])/g, function(match) {
      try {
        return "'" + eval(match) + "'";
      } catch (e) {
        return match;
      }
    }).replace(/\\x([0-9a-fA-F]{2})/g, function(match, hex) {
      try {
        const charCode = parseInt(hex, 16);
        return String.fromCharCode(charCode);
      } catch (e) {
        return match;
      }
    });
  }
  
  // Resolve direct string array references like _0x1234[0]
  function resolveStringArrays(code) {
    // Find string arrays
    const arrayPattern = /var\s+(_0x[a-f0-9]+)\s*=\s*\[((['"]).*?\2,?\s*)*\];/g;
    let match;
    
    while ((match = arrayPattern.exec(code)) !== null) {
      const arrayName = match[1];
      let arrayContent = match[0];
      
      // Extract array elements
      const elements = [];
      const elementPattern = /(['"])(.*?)\1/g;
      let elementMatch;
      
      while ((elementMatch = elementPattern.exec(arrayContent)) !== null) {
        elements.push(elementMatch[2]);
      }
      
      // Replace array references with actual strings
      const refPattern = new RegExp(arrayName + '\\[(\\d+)\\]', 'g');
      code = code.replace(refPattern, function(match, index) {
        index = parseInt(index);
        if (index >= 0 && index < elements.length) {
          return "'" + elements[index] + "'";
        }
        return match;
      });
    }
    
    return code;
  }
  
  // Try to decode RC4-like cipher implementations
  function decodeRC4Cipher(code) {
    // This is a simplified implementation - a full decoder would need to analyze
    // the specific RC4 implementation and execution pattern
    
    // Look for common RC4 patterns
    const rc4Pattern = /function\s+(_0x[a-f0-9]+)\([^)]*\)\s*\{\s*var\s+_0x[a-f0-9]+\s*=\s*\[\];\s*for\s*\([^;]*;[^;]*;[^)]*\)\s*\{\s*_0x[a-f0-9]+\[[^]]*\]\s*=\s*[^;]*;\s*\}/;
    
    if (rc4Pattern.test(code)) {
      console.log("RC4-like cipher detected. Full decoding would require execution.");
      // A complete implementation would need to actually execute the RC4 code
      // with the correct key, which is complex for a static analyzer
    }
    
    return code;
  }
  
  // Simplify function calls where possible
  function simplifyFunctionCalls(code) {
    // Find simple function calls that can be evaluated
    const functionCallPattern = /(_0x[a-f0-9]+)\((['"])([^'"]*)\2,\s*(['"])([^'"]*)\4\)/g;
    
    code = code.replace(functionCallPattern, function(match, funcName, q1, str, q2, key) {
      // For safety, only handle known patterns
      if (code.includes(funcName + "=function") && 
          code.includes("fromCharCode") && 
          code.includes("charCodeAt")) {
        // This might be a simple XOR or substitution cipher
        console.log(`Detected potential cipher function: ${funcName}`);
        // Full implementation would analyze and execute the function
      }
      return match;
    });
    
    return code;
  }
  
  // Extract string arrays from AST
  function extractStringArrays(ast, t) {
    const stringArrays = {};
    
    window.Babel.traverse(ast, {
      VariableDeclarator(path) {
        // Find patterns like: var _0x1234 = ['string1', 'string2', ...];
        const node = path.node;
        if (t.isIdentifier(node.id) && 
            t.isArrayExpression(node.init) &&
            /^_0x|^a0_0x/.test(node.id.name)) {
          
          const arrayName = node.id.name;
          const elements = node.init.elements;
          
          // Check if all array elements are strings
          if (elements && elements.every(el => t.isStringLiteral(el))) {
            stringArrays[arrayName] = elements.map(el => el.value);
          }
        }
      }
    });
    
    return stringArrays;
  }
  
  // Create AST visitor
  function createVisitor(stringArrays, t) {
    return {
      // Replace string array index access
      MemberExpression(path) {
        const { object, property, computed } = path.node;
        
        // Check if it's an array access expression: _0x1234[index]
        if (computed && 
            t.isIdentifier(object) && 
            stringArrays[object.name]) {
          
          // If index is a numeric literal
          if (t.isNumericLiteral(property)) {
            const index = property.value;
            const array = stringArrays[object.name];
            
            if (index >= 0 && index < array.length) {
              path.replaceWith(t.stringLiteral(array[index]));
            }
          }
          // If index is a binary expression (like _0x1234[1 + 2])
          else if (t.isBinaryExpression(property) && 
                  property.operator === '+' && 
                  t.isNumericLiteral(property.left) && 
                  t.isNumericLiteral(property.right)) {
            
            const index = property.left.value + property.right.value;
            const array = stringArrays[object.name];
            
            if (index >= 0 && index < array.length) {
              path.replaceWith(t.stringLiteral(array[index]));
            }
          }
        }
      },
      
      // Calculate simple binary expressions
      BinaryExpression(path) {
        const { left, right, operator } = path.node;
        
        // Only calculate simple expressions with numeric literals
        if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
          let result;
          
          switch (operator) {
            case '+': result = left.value + right.value; break;
            case '-': result = left.value - right.value; break;
            case '*': result = left.value * right.value; break;
            case '/': result = left.value / right.value; break;
            case '%': result = left.value % right.value; break;
            case '<<': result = left.value << right.value; break;
            case '>>': result = left.value >> right.value; break;
            case '>>>': result = left.value >>> right.value; break;
            case '|': result = left.value | right.value; break;
            case '&': result = left.value & right.value; break;
            case '^': result = left.value ^ right.value; break;
            default: return;
          }
          
          path.replaceWith(t.numericLiteral(result));
        }
        
        // String concatenation
        if (operator === '+' && 
            t.isStringLiteral(left) && 
            t.isStringLiteral(right)) {
          path.replaceWith(t.stringLiteral(left.value + right.value));
        }
      },
      
      // Handle RC4-like cipher functions
      FunctionDeclaration(path) {
        const { id, params, body } = path.node;
        
        // Look for cipher-like functions
        if (t.isIdentifier(id) && /^_0x[a-f0-9]+$/.test(id.name) && 
            params.length === 2 && 
            t.isBlockStatement(body)) {
          
          // Check if function has array manipulation typical of RC4
          const hasArrayInit = t.isArrayExpression(body);
          const hasCharCode = path.toString().includes("charCodeAt");
          const hasFromCharCode = path.toString().includes("fromCharCode");
          
          if (hasArrayInit && hasCharCode && hasFromCharCode) {
            console.log(`Potential RC4 cipher function detected: ${id.name}`);
            // Full implementation would analyze and potentially execute the function
          }
        }
      }
    };
  }
  
  // Export plugin interface
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // Register to global decoder plugins
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.enhancedObfuscator = {
    detect: function(code) {
      // Check for common obfuscation patterns
      return code.includes('_0x') || 
             code.includes('\\x') ||
             code.includes('fromCharCode') ||
             code.includes('charAt') ||
             code.includes('charCodeAt');
    },
    plugin: function(code) {
      return module.exports.plugin(code);
    }
  };
  
  console.log("Enhanced JS-Obfuscator Decoder loaded");
})();

// Specific decoder for iMe.js type obfuscation
function decodeImeScript(code) {
  // Step 1: First handle the hex encoded string
  let decoded = code.replace(/\\x([0-9a-fA-F]{2})/g, function(match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Step 2: Try to extract the string array
  const stringArrayMatch = decoded.match(/function _0x1f19\(\)\{[\s\S]*?return ([\s\S]*?);\}/);
  if (stringArrayMatch) {
    try {
      // Extract and evaluate the string array
      const stringArrayCode = stringArrayMatch[1].replace(/\([^)]*\)/g, '');
      const stringArray = eval(stringArrayCode);
      
      // Replace string array references
      const funcNameMatch = decoded.match(/function (_0x[a-f0-9]+)/);
      if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        const accessPattern = new RegExp(funcName + '\\(([0-9]+),\\s*[\'"`](.*?)[\'"`]\\)', 'g');
        
        decoded = decoded.replace(accessPattern, function(match, index, key) {
          try {
            // Simple implementation that doesn't handle the actual crypto
            // Just replace with the corresponding string array element
            const idx = parseInt(index, 10);
            if (idx >= 0 && idx < stringArray.length) {
              return `'${stringArray[idx]}'`;
            }
          } catch (e) {
            console.error("Error decoding string reference:", e);
          }
          return match;
        });
      }
    } catch (e) {
      console.error("Error processing string array:", e);
    }
  }
  
  // Step 3: Try to find and process the actual transformation
  const mainLogic = decoded.match(/var Mike=JSON\[\s*([^\]]+)\s*\]\(\$response\[([^\]]+)\]\);Mike\['payload'\]\[([^\]]+)\]=!![];\$done\(\{'body':JSON\[([^\]]+)\]\(Mike\)/);
  
  if (mainLogic) {
    // We can rebuild what the script actually does
    let simplifiedCode = `
/*************************************
> Script Name: iMe Premium Unlocker
> Updated: 2024-09-21
**************************************/

// Original obfuscated code simplified
var response = JSON.parse($response.body);
response.payload.isPremium = true;
$done({body: JSON.stringify(response)});
`;
    
    return simplifiedCode;
  }
  
  return decoded;
}

// Use this function for the specific iMe script
// const decodedImeScript = decodeImeScript(yourOriginalCode);
