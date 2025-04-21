import * as core from "@actions/core";
// 移除 Slack webhook 导入
// import { IncomingWebhook } from "@slack/webhook";
import axios from "axios";
import * as qs from "querystring";

(async () => {
  // Validate parameters
  // 移除 slack-incoming-webhook-url 参数
  const [ productId, scheduleId, seatId ] = [
    "product-id",
    "schedule-id",
    "seat-id",
    // "slack-incoming-webhook-url", // 移除
  ].map((name) => {
    const value = core.getInput(name);
    if (!value) {
      throw new Error(`melon-ticket-actions: Please set ${name} input parameter`);
    }

    return value;
  });

  // 移除 message 参数，因为不再发送 Slack 消息
  // const message = core.getInput("message") ?? "티켓사세요";

  // 移除 webhook 初始化
  // const webhook = new IncomingWebhook(webhookUrl);

  const res = await axios({
    method: "POST",
    url: "https://ticket.melon.com/tktapi/product/seatStateInfo.json",
    params: {
      v: "1",
    },
    headers: { // 保留之前添加的 headers
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': `https://ticket.melon.com/performance/index.htm?prodId=${productId}`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: qs.stringify({
      prodId: productId,
      scheduleNo: scheduleId,
      seatId,
      volume: 1,
      selectedGradeVolume: 1,
    }),
  });

  // tslint:disable-next-line
  console.log("Got response: ", res.data);

  if (res.data.chkResult) {
    // 移除 Slack 发送逻辑
    // const link = `http://ticket.melon.com/performance/index.htm?${qs.stringify({
    //   prodId: productId,
    // })}`;
    // await webhook.send(`${message} ${link}`);
    // 你可以在这里添加日志或其他逻辑，表示检查成功，有余票（虽然这个 API 可能不直接返回是否有票）
    console.log("Check successful, chkResult is true. Further checks might be needed for actual availability.");
    // 如果需要输出一个值给后续步骤（比如 Server酱）使用，可以这样做：
    core.setOutput("available", "true"); // 输出一个名为 available 的 output，值为 true
  } else {
    // 如果检查失败或者没有余票，也可以输出
    core.setOutput("available", "false");
  }
})().catch((e) => {
  console.error(e.stack); // tslint:disable-line
  core.setFailed(e.message);
});