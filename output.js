//Sat Apr 12 2025 05:31:56 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
/**
 * 壁纸解锁脚本分析报告
 * 
 * 脚本名称: 壁纸解锁Svip、Vip、无限涂鸦币
 * 作者: M̆̈̆̈ĭ̈̆̈k̆̈̆̈ĕ̈
 * 更新时间: 2025-01-09
 * 目标URL: leancloud.emotionwp.com
 * 
 * 混淆类型: JSFuck变种 + 颜文字混淆
 * 混淆级别: 高
 * 
 * 功能分析:
 * 1. 本脚本针对壁纸应用的API响应进行修改
 * 2. 主要目的是解锁SVIP、VIP权限及无限涂鸦币
 * 3. 采用极端混淆手段隐藏实际功能代码
 * 4. 主要修改leancloud.emotionwp.com的API响应数据
 * 
 * 执行流程:
 * 1. 定义颜文字变量作为基础执行环境
 * 2. 构建自定义eval执行器
 * 3. 执行混淆后的主要功能代码(修改API响应)
 * 
 * 注意事项:
 * - 使用此脚本可能导致AppleStore无法切换账户
 * - 可通过关闭QX、关闭MITM、删除脚本或在设置中切换ID来解决
 * 
 * 无法完全解码的原因:
 * - 使用了非标准JSFuck变种混淆
 * - 自定义执行环境增加了解码难度
 * - 动态执行机制需要运行时环境支持
 */

// 原始混淆代码已被分析，无法直接转换为可读代码
// 基于分析，以下是脚本可能的等效功能代码

// ==UserScript==
// @ScriptName        壁纸解锁Svip、Vip、无限涂鸦币
// @Author            M̆̈̆̈ĭ̈̆̈k̆̈̆̈ĕ̈
// @UpdateTime        2025-01-09
// @Attention         使用此脚本，会导致AppleStore无法切换账户
// @Solution          关闭QX切换账户，或关闭MITM，或删除脚本，或去设置媒体与购买项目处切换ID
// ==/UserScript==

// 等效功能代码(仅供参考，非实际解码结果)
const url = $request.url;
let body = $response.body;

try {
  if (url.includes("classes") || url.includes("batch/save")) {
    const data = JSON.parse(body);
    
    // 修改用户状态为SVIP/VIP
    if (data.results && data.results.length > 0) {
      data.results.forEach(item => {
        if (item.vipStatus !== undefined) {
          item.vipStatus = true;
        }
        if (item.svipStatus !== undefined) {
          item.svipStatus = true;
        }
        if (item.coins !== undefined || item.graffiti_coins !== undefined) {
          // 设置涂鸦币为大数值
          item.coins = 999999;
          item.graffiti_coins = 999999;
        }
      });
    }
    
    // 如果是单个对象响应
    if (data.vipStatus !== undefined) {
      data.vipStatus = true;
    }
    if (data.svipStatus !== undefined) {
      data.svipStatus = true;
    }
    if (data.coins !== undefined || data.graffiti_coins !== undefined) {
      data.coins = 999999;
      data.graffiti_coins = 999999;
    }
    
    body = JSON.stringify(data);
  }
} catch (e) {
  console.log("解析错误: " + e.message);
}

$done({body});
