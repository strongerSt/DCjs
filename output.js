//Thu Jan 16 2025 02:59:11 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const a = $request.url;
let pdfCount = 0;
if (/^https:\/\/pptdashi\.kuoliang\.cn\/package\/ppt\/(getAll|getRandom)\?.*/.test(a)) {
  const b = $response.body;
  try {
    const c = JSON.parse(b);
    c.data.forEach(I11li1I1 => {
      console.log("名称：" + I11li1I1.shortTitle);
      console.log("大小：" + I11li1I1.fileSize);
      console.log("下载地址：" + I11li1I1.fileDownloadUrl + "\n");
      pdfCount++;
    });
  } catch (lliiIlli) {
    console.log("解析错误：" + lliiIlli);
  }
}
const isQuanX = typeof $task !== "undefined",
  isLoon = typeof $loon !== "undefined",
  isSurgeLike = typeof $httpClient !== "undefined",
  isSurge = typeof $environment !== "undefined" && $environment["surge-version"] !== "undefined";
function notify(I1Ii1i1, l1IIII, lI1illil, II1lIi11) {
  if (isQuanX) $notify(I1Ii1i1, l1IIII, lI1illil, {
    "open-url": II1lIi11
  });else isSurgeLike && $notification.post(I1Ii1i1, l1IIII, lI1illil, isLoon ? {
    "openUrl": II1lIi11
  } : {
    "url": II1lIi11
  });
}
notify("PDF统计", "共找到" + pdfCount + "个PDF", "详细查看日志\n作者：iu");
$done({});